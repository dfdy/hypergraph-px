// SPDX-License-Identifier: AGPL-3.0-only
//! Bounded validation of an explicitly supplied expansion dependency projection.
//!
//! Vertices are exact resolved contexts chosen by the caller, not mutable content
//! heads. Parallel edges and repeated dependencies are legitimate. Hyperlinks
//! must not be included: cycles in that different projection are permitted.
//! This does not validate occurrence-parent ownership, authorize reads, compute
//! document order, or prove that the caller supplied a complete snapshot closure.

use std::collections::{BTreeMap, VecDeque};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Budget {
    pub vertices: usize,
    pub edges: usize,
    /// Registration, edge validation, vertex removal and edge removal each cost one.
    pub work: usize,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Budget,
    DuplicateVertex,
    UnknownVertex,
    Cycle,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Validated {
    pub vertices: usize,
    pub edges: usize,
    pub work: usize,
}

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
    let mut pending: VecDeque<_> = graph
        .iter()
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
