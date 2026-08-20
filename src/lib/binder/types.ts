/**
 * The card shape the binder renders. Deliberately NOT the schema — there is no
 * schema yet, and the tier boundary in CLAUDE.md decides what these fields become
 * when there is one. This is the minimum the reveal needs.
 */
export type Card = {
	/** filename under preview/img — hardcoded fixtures, not catalogue data */
	f: string;
	/** subject */
	n: string;
	year: string;
	set: string;
	/** parallel, e.g. "Blue Wave" — belongs to the card, not the holding */
	parallel: string | null;
	/** print run, e.g. "/199" */
	serial: string | null;
};

/** A pocket is a card or nothing. There is deliberately no third state — see
 *  "OPEN — a card that is owned and has no image" in docs/design-decisions.md. */
export type Slot = Card | null;

export type Spread = { l: Slot[]; r: Slot[] };
