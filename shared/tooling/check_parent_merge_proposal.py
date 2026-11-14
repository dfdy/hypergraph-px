#!/usr/bin/env python3
"""Executable examples for the ADR015 staged temporal parent-Merge direction.

Assumes exact, already aligned regions and trusted passage-change orders.
Not a text diff, application planner, database codec, migration or proof.
"""
from dataclasses import dataclass

MAX_ORDER = 2**53 - 1


class Unresolved(Exception):
    pass


@dataclass(frozen=True)
class Passage:
    # None is deletion; b'' is present empty text.
    text: bytes | None
    order: int | None
    origins: frozenset[str] = frozenset()

    def __post_init__(self):
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
    selected: Passage
    # Keep both exact inputs even when one loses or both have the same bytes.
    alternatives: tuple[Passage, Passage]


def choose(base: Passage, source: Passage, target: Passage) -> Choice:
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
    if set(base) != set(source) or set(base) != set(target):
        raise ValueError('region alignment must be supplied explicitly')
    # A later failure returns no partial result and never mutates an input.
    return {key: choose(base[key], source[key], target[key]) for key in base}


@dataclass(frozen=True)
class Revision:
    node: str
    parents: tuple[str, ...]


def ancestry(graph, revision, node, remaining):
    seen, active = set(), set()

    def visit(current):
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
    global checks
    if not value:
        raise AssertionError(f'proposal check {checks + 1} failed')
    checks += 1


def rejects(error, action):
    try:
        action()
    except error:
        check(True)
    else:
        check(False)


def main():
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
    rejects(Unresolved, lambda: choose(monday, Passage(b'Tuesday', None, frozenset({'legacy-tuesday'})), wednesday))
    rejects(Unresolved, lambda: choose(monday, tuesday, Passage(b'Wednesday', None, frozenset({'legacy-wednesday'}))))
    rejects(Unresolved, lambda: choose(monday, tuesday, Passage(b'Wednesday', 1)))
    # A reversion is an actual new edit, not an unchanged base passage.
    check(choose(monday, Passage(b'Monday', 4), wednesday).selected == Passage(b'Monday', 4))
    check(choose(monday, tuesday, Passage(None, 3)).selected.text is None)
    check(choose(monday, Passage(b'Thursday', 4), Passage(None, 3)).selected.text == b'Thursday')
    check(choose(monday, Passage(b'', 4), Passage(None, 3)).selected.text == b'')
    raw = 'e\u0301😀\r\n中\r'.encode()
    check(choose(Passage(b'', 0), Passage(raw, 8), Passage(b'other', 7)).selected.text == raw)
    for invalid in (-1, True, 1.5, MAX_ORDER + 1):
        rejects(ValueError, lambda invalid=invalid: Passage(b'text', invalid))
    rejects(ValueError, lambda: Passage('not bytes', 1))
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
    rejects(ValueError, lambda: authored_commit(source, {'date': b'X', 'other': b'Original'}, 1))
    rejects(ValueError, lambda: authored_commit(source, {'date': b'X'}, 2))
    unknown = {'date': Passage(b'Legacy', None, frozenset({'legacy'})), 'other': Passage(b'Original', 0)}
    before = dict(unknown)
    rejects(Unresolved, lambda: merge_regions(base, unknown, target))
    check(unknown == before)
    rejects(ValueError, lambda: merge_regions(base, {}, target))
    # Equal deletion choices retain both inputs, too.
    deleted = choose(monday, Passage(None, 4), Passage(None, 5))
    check(deleted.selected.text is None and deleted.selected.order == 5 and len(deleted.alternatives) == 2)
    check(deleted.selected.origins == frozenset({'order:4', 'order:5'}))
    legacy_base = Passage(b'Monday', None, frozenset({'legacy-base'}))
    legacy_revert = Passage(b'Monday', None, frozenset({'legacy-revert'}))
    rejects(Unresolved, lambda: choose(legacy_base, legacy_revert, wednesday))
    check(choose(legacy_base, tuesday, legacy_base).selected == tuesday)
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
    rejects(Unresolved, lambda: common_base(graph, 's', 'p', budget=1))
    rejects(Unresolved, lambda: common_base(graph, 'missing', 'p'))
    rejects(Unresolved, lambda: common_base({**graph, 'x': Revision('other', ())}, 'x', 'p'))
    rejects(Unresolved, lambda: common_base({**graph, 'x': Revision('n', ())}, 'x', 'p'))
    rejects(Unresolved, lambda: common_base({'x': Revision('n', ('x',))}, 'x', 'x'))
    crossed = {**graph, 'x': Revision('n', ('p', 's')), 'y': Revision('n', ('s', 'p'))}
    rejects(Unresolved, lambda: common_base(crossed, 'x', 'y'))
    print(f'PASS: {checks} proposed parent-Merge model checks; aligned regions/trusted orders assumed; no application writes')


if __name__ == '__main__':
    main()
