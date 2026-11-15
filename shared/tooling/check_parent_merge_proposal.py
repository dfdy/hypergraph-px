#!/usr/bin/env python3
"""Hypergraph PX — Supplied-evidence parent-Merge examples

Explore passage selection, explicit change order and unique DAG common bases using already aligned regions and trusted symbolic inputs.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_parent_merge_proposal.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Developers reviewing the staged parent-Merge design; not the production text diff or storage writer.

Specification:
- [Parent-Merge algorithm contract](../../docs/07-implementation/algorithms/parent-merge.md)
- [Draft/publication boundaries](../../docs/07-implementation/protocols/draft-publication.md)

Boundary: This executable example assumes alignment and chronology. It allocates no real clocks, validates no authenticated storage and supplies no Lean/Rust correspondence proof.
"""
from dataclasses import dataclass

MAX_ORDER = 2**53 - 1


class Unresolved(Exception):
    """Signal that supplied alignment, chronology or ancestry evidence cannot establish a unique safe model result."""

    pass


@dataclass(frozen=True)
class Passage:
    """Retain one aligned region as exact UTF8 bytes or deletion, with supplied change order and origin identities."""

    # None is deletion; b'' is present empty text.
    text: bytes | None
    order: int | None
    origins: frozenset[str] = frozenset()

    def __post_init__(self):
        """Reject nonbytes/invalid UTF8 or invalid order and require an exact origin even when chronology is unknown."""

        if self.text is not None:
            if type(self.text) is not bytes:
                raise ValueError('exact bytes required')
            self.text.decode('utf8', errors='strict')
        if self.order is not None and (
            type(self.order) is not int or not 0 <= self.order <= MAX_ORDER
        ):
            raise ValueError('invalid supplied order')
        if not self.origins:
            if self.order is None:
                raise ValueError('unknown chronology still needs exact origin identity')
            object.__setattr__(self, 'origins', frozenset({f'order:{self.order}'}))


@dataclass(frozen=True)
class Choice:
    """Retain the selected region together with both exact alternatives, preserving evidence even when one loses."""

    selected: Passage
    # Keep both exact inputs even when one loses or both have the same bytes.
    alternatives: tuple[Passage, Passage]


def choose(base: Passage, source: Passage, target: Passage) -> Choice:
    """Resolve one aligned passage pair against the base, retaining alternatives and refusing unestablished competing order."""

    if source == base:
        selected = target
    elif target == base:
        selected = source
    elif source.text == target.text:
        # Equal bytes require no content decision, but do not invent chronology.
        order = None if None in (source.order, target.order) else max(source.order, target.order)
        selected = Passage(source.text, order, source.origins | target.origins)
    elif source.order is None or target.order is None or source.order == target.order:
        raise Unresolved('no established later competing passage')
    else:
        selected = source if source.order > target.order else target
    return Choice(selected, (source, target))


def authored_commit(previous: dict[str, Passage], text: dict[str, bytes | None], order: int):
    """Stamp only actually changed aligned regions with a fresh supplied order while preserving unchanged origins."""

    if set(previous) != set(text):
        raise ValueError('region alignment must be supplied explicitly')
    changed = any(previous[key].text != text[key] for key in previous)
    if not changed:
        return dict(previous)
    if type(order) is not int or not 0 < order <= MAX_ORDER:
        raise ValueError('invalid proposed fresh order')
    if any(p.order is not None and p.order >= order for p in previous.values()):
        raise ValueError('fresh node order required')
    return {key: Passage(text[key], order) if previous[key].text != text[key] else previous[key]
            for key in previous}


def merge_regions(base, source, target):
    """Require identical region keys and choose every result without mutating input maps or returning partial failure."""

    if set(base) != set(source) or set(base) != set(target):
        raise ValueError('region alignment must be supplied explicitly')
    # A later failure returns no partial result and never mutates an input.
    return {key: choose(base[key], source[key], target[key]) for key in base}


@dataclass(frozen=True)
class Revision:
    """Represent supplied same-node revision identity and parent links for bounded ancestry/common-base examples."""

    node: str
    parents: tuple[str, ...]


def ancestry(graph, revision, node, remaining):
    """Walk supplied same-node parents under a shared budget, rejecting cycles, missing records and cross-node links."""

    seen, active = set(), set()

    def visit(current):
        """Track active versus completed revisions so shared ancestors remain valid while true recursion cycles fail."""

        if current in active:
            raise Unresolved('cycle')
        if current in seen:
            return
        if remaining[0] == 0:
            raise Unresolved('incomplete budget')
        remaining[0] -= 1
        item = graph.get(current)
        if item is None or item.node != node:
            raise Unresolved('missing or cross-node ancestry')
        active.add(current)

        for parent in item.parents:
            visit(parent)
        active.remove(current)
        seen.add(current)

    visit(revision)
    return seen


def common_base(graph, source, target, node='n', budget=128):
    """Select exactly one maximal common ancestor from complete supplied closures; do not guess through ambiguity or exhaustion."""

    remaining = [budget]
    common = ancestry(graph, source, node, remaining) & ancestry(graph, target, node, remaining)
    closures = {key: ancestry(graph, key, node, remaining) for key in common}
    maximal = [key for key in common if not any(key != other and key in closures[other]
                                               for other in common)]
    if len(maximal) != 1:
        raise Unresolved('no unique maximal common base')
    return maximal[0]


checks = 0


def check(value):
    """Count a model assertion only after it holds, making a failed example stop the run."""

    global checks
    if not value:
        raise AssertionError(f'proposal check {checks + 1} failed')
    checks += 1


def rejects(error, action):
    """Require the supplied failing operation to raise the expected exception, rather than accepting silent success."""

    try:
        action()
    except error:
        check(True)
    else:
        check(False)


def main():
    """Exercise explicit chronology, unchanged/reverted passages, exact bytes and graph ancestry failure boundaries."""

    monday, tuesday, wednesday = Passage(b'Monday', 0), Passage(b'Tuesday', 1), Passage(b'Wednesday', 2)
    first = choose(monday, tuesday, wednesday)
    check(first.selected == wednesday)
    check(first.alternatives == (tuesday, wednesday))
    check(choose(monday, Passage(b'Tuesday', 3), wednesday).selected.text == b'Tuesday')
    check(choose(monday, monday, wednesday).selected == wednesday)
    check(choose(monday, tuesday, monday).selected == tuesday)
    check(choose(monday, monday, monday).selected == monday)
    check(choose(monday, tuesday, tuesday).selected == tuesday)
    check(choose(monday, Passage(b'Tuesday', None, frozenset({'legacy-tuesday'})), tuesday).selected.order is None)
    # Exercise unknown source chronology: a later winner cannot be invented from its exact origin alone.
    rejects(Unresolved, lambda: choose(monday, Passage(b'Tuesday', None, frozenset({'legacy-tuesday'})), wednesday))
    # Exercise unknown target chronology: exact target identity does not supply an ordering value.
    rejects(Unresolved, lambda: choose(monday, tuesday, Passage(b'Wednesday', None, frozenset({'legacy-wednesday'}))))
    # Exercise tied competing order: equal clocks do not establish a later passage.
    rejects(Unresolved, lambda: choose(monday, tuesday, Passage(b'Wednesday', 1)))
    # A reversion is an actual new edit, not an unchanged base passage.
    check(choose(monday, Passage(b'Monday', 4), wednesday).selected == Passage(b'Monday', 4))
    check(choose(monday, tuesday, Passage(None, 3)).selected.text is None)
    check(choose(monday, Passage(b'Thursday', 4), Passage(None, 3)).selected.text == b'Thursday')
    check(choose(monday, Passage(b'', 4), Passage(None, 3)).selected.text == b'')
    raw = 'e\u0301😀\r\n中\r'.encode()
    check(choose(Passage(b'', 0), Passage(raw, 8), Passage(b'other', 7)).selected.text == raw)

    for invalid in (-1, True, 1.5, MAX_ORDER + 1):
        # Bind each malformed order to this fixture so deferred execution checks that specific invalid value.
        rejects(ValueError, lambda invalid=invalid: Passage(b'text', invalid))
    # Exercise nonbyte input rejection before any merge decision.
    rejects(ValueError, lambda: Passage('not bytes', 1))
    # Exercise invalid UTF8 byte rejection without silent normalization.
    rejects(UnicodeDecodeError, lambda: Passage(b'\xff', 1))
    base = {'date': monday, 'other': Passage(b'Original', 0)}
    source = authored_commit(base, {'date': b'Tuesday', 'other': b'Original'}, 1)
    target = authored_commit(base, {'date': b'Wednesday', 'other': b'Original'}, 2)
    check(source['other'] == base['other'])
    check(target['date'] == wednesday)
    later = authored_commit(target, {'date': b'Wednesday', 'other': b'Unrelated later edit'}, 10)
    check(later['date'] == wednesday)
    newer_source = authored_commit(source, {'date': b'Thursday', 'other': b'Original'}, 4)
    result = merge_regions(base, newer_source, later)
    check(result['date'].selected == Passage(b'Thursday', 4))
    check(result['other'].selected == Passage(b'Unrelated later edit', 10))
    check(later['date'] == wednesday and source['date'] == tuesday)
    # Merge imports carry their origins; no authored_commit re-stamping here.
    check(result['date'].selected.order != 11)
    no_op = authored_commit(newer_source, {'date': b'Thursday', 'other': b'Original'}, 11)
    check(no_op == newer_source)
    reverted = authored_commit(source, {'date': b'Monday', 'other': b'Original'}, 5)
    check(reverted['date'] == Passage(b'Monday', 5))
    # Attempt a changed passage with a nonfresh node order and require refusal.
    rejects(ValueError, lambda: authored_commit(source, {'date': b'X', 'other': b'Original'}, 1))
    # Attempt an unaligned authored region map and require explicit failure.
    rejects(ValueError, lambda: authored_commit(source, {'date': b'X'}, 2))
    unknown = {'date': Passage(b'Legacy', None, frozenset({'legacy'})), 'other': Passage(b'Original', 0)}
    before = dict(unknown)
    # Attempt competing unknown-order content and verify the original map remains unchanged.
    rejects(Unresolved, lambda: merge_regions(base, unknown, target))
    check(unknown == before)
    # Attempt a missing region map instead of silently merging partial coverage.
    rejects(ValueError, lambda: merge_regions(base, {}, target))
    # Equal deletion choices retain both inputs, too.
    deleted = choose(monday, Passage(None, 4), Passage(None, 5))
    check(deleted.selected.text is None and deleted.selected.order == 5 and len(deleted.alternatives) == 2)
    check(deleted.selected.origins == frozenset({'order:4', 'order:5'}))
    legacy_base = Passage(b'Monday', None, frozenset({'legacy-base'}))
    legacy_revert = Passage(b'Monday', None, frozenset({'legacy-revert'}))
    # Exercise equal-byte legacy reversion with unknown chronology, not unchanged-base identity.
    rejects(Unresolved, lambda: choose(legacy_base, legacy_revert, wednesday))
    check(choose(legacy_base, tuesday, legacy_base).selected == tuesday)
    # Require exact origin identity even when passage order is unknown.
    rejects(ValueError, lambda: Passage(b'unknown without origin', None))
    graph = {'a': Revision('n', ()), 's': Revision('n', ('a',)),
             'p': Revision('n', ('a',)), 'm': Revision('n', ('p', 's')),
             's2': Revision('n', ('s',))}
    check(common_base(graph, 's', 'p') == 'a')
    check(common_base(graph, 's', 'm') == 's')
    check(common_base(graph, 's2', 'm') == 's')
    check('s' in ancestry(graph, 'm', 'n', [20]))
    # Already incorporated losing Tuesday cannot reappear merely on repeat Merge.
    check(choose(tuesday, tuesday, first.selected).selected == wednesday)
    check(choose(tuesday, Passage(b'Thursday', 4), first.selected).selected.text == b'Thursday')
    # Equal text is not proof that the second branch is already in ancestry.
    check('s' not in ancestry(graph, 'p', 'n', [20]))
    check(choose(monday, tuesday, Passage(b'Tuesday', 2)).selected.text == b'Tuesday')
    # Exercise incomplete shared ancestry budget rather than guessing a common root.
    rejects(Unresolved, lambda: common_base(graph, 's', 'p', budget=1))
    # Exercise a missing requested revision rather than treating it as a root.
    rejects(Unresolved, lambda: common_base(graph, 'missing', 'p'))
    # Exercise a cross-node ancestor request, which is not same-identity history.
    rejects(Unresolved, lambda: common_base({**graph, 'x': Revision('other', ())}, 'x', 'p'))
    # Exercise disjoint same-node histories with no common ancestor.
    rejects(Unresolved, lambda: common_base({**graph, 'x': Revision('n', ())}, 'x', 'p'))
    # Exercise a self-parent cycle as invalid revision ancestry.
    rejects(Unresolved, lambda: common_base({'x': Revision('n', ('x',))}, 'x', 'x'))
    crossed = {**graph, 'x': Revision('n', ('p', 's')), 'y': Revision('n', ('s', 'p'))}
    # Exercise incomparable maximal bases rather than substituting an older root.
    rejects(Unresolved, lambda: common_base(crossed, 'x', 'y'))
    print(f'PASS: {checks} proposed parent-Merge model checks; aligned regions/trusted orders assumed; no application writes')


if __name__ == '__main__':
    main()
