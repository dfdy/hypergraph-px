// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Bounded supplied-DAG validation and budget accounting
//!
//! Check acyclicity of an explicitly supplied finite dependency projection
//! using Kahn’s algorithm and independent input/work allowances.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root (OpenAI coding agent).
//! Latest editing harness: Codex; version/build: unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Domain graph tests and the extracted spend-helper proof workflow.
//! No production caller of this complete DAG validator is present in this slice.
//!
//! Specification:
//! - [Expansion responsibility and implementation limits][domain]
//! - [Accepted cycle-aware inclusion policy][cycles]
//! - [Formal evidence and extracted helper scope][proofs]
//!
//! Boundary: This legacy DAG helper rejects cycles in its supplied projection; it is not
//! the later accepted cycle-aware inclusion traversal and does not forbid saving
//! cyclic inclusion. It proves neither source authentication nor complete closure.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/domain/src/expansion.rs
//! [domain]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [cycles]: ../../../../docs/05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041
//! [proofs]: ../../../../docs/07-implementation/formal-invariants.md

use std::collections::{BTreeMap, VecDeque};

/// Independent supplied graph-size limits and logical processing allowance.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Budget {
    /// Maximum number of supplied vertices before any graph allocation.
    pub vertices: usize,

    /// Maximum number of supplied directed edges, including parallel incidences.
    pub edges: usize,

    /// Registration, edge validation, vertex removal and edge removal each cost one.
    /// Logical allowance for registration, endpoint validation and removals.
    pub work: usize,
}

/// Invalid supplied graph or exhaustion; no partial validated graph is returned.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// An input count or logical work charge exceeds its allowance.
    Budget,
    /// The vertex catalogue repeats an opaque input ID.
    DuplicateVertex,
    /// An edge endpoint is missing from the supplied vertex catalogue.
    UnknownVertex,
    /// Some supplied vertices remain after removing all zero-indegree vertices.
    Cycle,
}

/// Successful counts and logical work, not an order or completeness certificate.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Validated {
    /// Number of distinct vertices successfully validated.
    pub vertices: usize,

    /// Number of supplied edges, preserving parallel-edge multiplicity.
    pub edges: usize,

    /// Exact charged operations for this complete successful traversal.
    pub work: usize,
}

/// Charge one operation before work; if already at the limit return Budget
/// without incrementing, preventing overflow on the successful increment path.
fn spend(work: &mut usize, budget: usize) -> Result<(), Error> {
    if *work >= budget {
        return Err(Error::Budget);
    }
    *work += 1;
    Ok(())
}

/// Validate acyclicity with Kahn's algorithm over a finite immutable edge list.
///
/// IDs are opaque ordered values local to this input; this chooses no durable ID
/// encoding. Memory is O(V + E); ordered-map lookup gives O((V + E) log V) time,
/// with a constant-time empty-graph case. Successful work is exactly 2V + 2E.
/// An error never mutates the input or returns a supposedly complete partial view.
pub fn validate<V: Copy + Ord>(
    vertices: &[V],
    edges: &[(V, V)],
    budget: Budget,
) -> Result<Validated, Error> {
    if vertices.len() > budget.vertices || edges.len() > budget.edges {
        return Err(Error::Budget);
    }
    let mut work = 0;
    let mut graph = BTreeMap::<V, (usize, Vec<V>)>::new();
    for &vertex in vertices {
        spend(&mut work, budget.work)?;
        if graph.insert(vertex, (0, Vec::new())).is_some() {
            return Err(Error::DuplicateVertex);
        }
    }
    for &(source, target) in edges {
        spend(&mut work, budget.work)?;
        graph.get_mut(&target).ok_or(Error::UnknownVertex)?.0 += 1;
        graph
            .get_mut(&source)
            .ok_or(Error::UnknownVertex)?
            .1
            .push(target);
    }

    // Queue only vertices whose remaining incoming-edge count is zero. Parallel
    // edges are counted and removed separately, so no global deduplication occurs.
    let mut pending: VecDeque<_> = graph
        .iter()
        // Select each registered zero-indegree vertex once for the initial queue.
        .filter_map(|(&vertex, (incoming, _))| (*incoming == 0).then_some(vertex))
        .collect();
    let mut visited = 0;
    while let Some(vertex) = pending.pop_front() {
        spend(&mut work, budget.work)?;
        visited += 1;
        let outgoing = std::mem::take(&mut graph.get_mut(&vertex).expect("registered vertex").1);
        for target in outgoing {
            spend(&mut work, budget.work)?;
            let incoming = &mut graph.get_mut(&target).expect("validated endpoint").0;
            *incoming -= 1;
            if *incoming == 0 {
                pending.push_back(target);
            }
        }
    }

    // Exhausting the queue with vertices left means a cycle in this projection.
    if visited != vertices.len() {
        return Err(Error::Cycle);
    }
    Ok(Validated {
        vertices: vertices.len(),
        edges: edges.len(),
        work,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const LIMIT: Budget = Budget {
        vertices: 100,
        edges: 100,
        work: 400,
    };

    /// Verify repeated/parallel dependencies and isolated vertices remain legitimate
    /// DAG input, with exact work counts and unchanged caller edges.
    #[test]
    fn repeated_diamond_dependencies_parallel_edges_and_isolated_vertices_are_valid() {
        let vertices = [1, 2, 3, 4, 5];
        let edges = [(1, 2), (1, 3), (2, 4), (3, 4), (1, 2)];
        assert_eq!(
            validate(&vertices, &edges, LIMIT),
            Ok(Validated {
                vertices: 5,
                edges: 5,
                work: 20,
            })
        );
        assert_eq!(edges, [(1, 2), (1, 3), (2, 4), (3, 4), (1, 2)]);
    }

    /// Verify this supplied-DAG helper detects reachable or disconnected cycles,
    /// without conflating that legacy helper scope with product inclusion policy.
    #[test]
    fn self_cycle_long_cycle_and_disconnected_cycle_are_rejected() {
        for edges in [
            vec![(1, 1)],
            vec![(1, 2), (2, 3), (3, 1)],
            vec![(2, 3), (3, 2)],
        ] {
            assert_eq!(validate(&[1, 2, 3], &edges, LIMIT), Err(Error::Cycle));
        }
    }

    /// Verify duplicate registrations and absent edge endpoints fail explicitly
    /// rather than silently adding or collapsing a vertex.
    #[test]
    fn invalid_vertex_catalogue_or_endpoints_are_rejected() {
        assert_eq!(validate(&[1, 1], &[], LIMIT), Err(Error::DuplicateVertex));
        assert_eq!(validate(&[1], &[(1, 2)], LIMIT), Err(Error::UnknownVertex));
        assert_eq!(validate(&[1], &[(2, 1)], LIMIT), Err(Error::UnknownVertex));
        assert_eq!(
            validate::<u8>(&[], &[(1, 2)], LIMIT),
            Err(Error::UnknownVertex)
        );
    }

    /// Check the precise successful work boundary and independent vertex/edge
    /// limits, including an empty graph with zero allowance.
    #[test]
    fn exact_work_boundary_and_independent_input_limits_are_enforced() {
        let vertices = [1, 2];
        let edges = [(1, 2)];
        assert_eq!(
            validate(&vertices, &edges, Budget { work: 6, ..LIMIT })
                .unwrap()
                .work,
            6
        );
        for budget in [
            Budget { work: 5, ..LIMIT },
            Budget {
                vertices: 1,
                ..LIMIT
            },
            Budget { edges: 0, ..LIMIT },
        ] {
            assert_eq!(validate(&vertices, &edges, budget), Err(Error::Budget));
        }
        assert!(
            validate::<u8>(
                &[],
                &[],
                Budget {
                    vertices: 0,
                    edges: 0,
                    work: 0
                }
            )
            .is_ok()
        );
    }

    /// Enumerate all directed three-vertex graphs and compare Kahn’s result with
    /// an independent transitive-closure oracle, including reordered input.
    #[test]
    fn all_three_vertex_graphs_match_an_independent_reachability_reference() {
        // Exhaustive directed graphs, including self-edges; independent closure
        // detects cycles without reusing Kahn's indegree/removal implementation.
        for mask in 0_u16..512 {
            let mut reachable = [[false; 3]; 3];
            let mut edges = Vec::new();
            for (from, row) in reachable.iter_mut().enumerate() {
                for (to, value) in row.iter_mut().enumerate() {
                    if mask & (1 << (from * 3 + to)) != 0 {
                        *value = true;
                        edges.push((from, to));
                    }
                }
            }
            for via in 0..3 {
                for from in 0..3 {
                    for to in 0..3 {
                        reachable[from][to] |= reachable[from][via] && reachable[via][to];
                    }
                }
            }
            // A self-reachable vertex witnesses a cycle in the independent oracle.
            let cyclic = (0..3).any(|v| reachable[v][v]);
            let original = edges.clone();
            let result = validate(&[0, 1, 2], &edges, LIMIT);
            assert_eq!(result.is_ok(), !cyclic, "graph {mask}");
            assert_eq!(edges, original);
            edges.reverse();
            assert_eq!(validate(&[2, 1, 0], &edges, LIMIT), result);
        }
    }
}
