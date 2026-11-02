# B1.49 live check — eligibility rule on a labeled issue

Repository `<lead>/level-up-lab` (public; one collaborator: the lead, admin). The lead does every GitHub write; the
agent runs only the read-only commands R1–R6 of `plan.md` after each step. Outputs are verbatim (stdout and stderr),
except that the lead's GitHub login reads `<lead>` (artifacts name roles).

## Baseline (no lead step)

R6 ghost: `gh api repos/{owner}/{repo}/collaborators/ghost/permission --jq [.permission, .role_name] | @tsv` → exit 0

```
read	read
```

R6 octocat (non-collaborator): `gh api repos/{owner}/{repo}/collaborators/octocat/permission --jq [.permission, .role_name] | @tsv` → exit 0

```
read	read
```

R6 lead: `gh api repos/{owner}/{repo}/collaborators/<lead>/permission --jq [.permission, .role_name] | @tsv` → exit 0

```
admin	admin
```

Collaborators: `gh api repos/{owner}/{repo}/collaborators --jq .[] | [.login, .role_name] | @tsv` → exit 0

```
<lead>	admin
```

## Step 1 — lead files issue A (#169), no label

R1 `scripts/agent/eligible.sh 169` → exit 1

```
eligible: #169 not labeled agent-ready
```

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```

```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(",")), .title, .user.login] | @tsv` → exit 0

```
open		B1.49 probe A (throwaway, do not run)	<lead>
```

Step 1 verdict: **pass** — R1 exit 1 `not labeled agent-ready`; R2 0 label rows; issue open, author `<lead>`.

Step 8: not run — the lead has no second (non-write) account. The author rule stays covered by R6 above (a
non-collaborator reads `read`) and the B1.43 smoke.

## Step 2 — lead adds `agent-ready`

R1 `scripts/agent/eligible.sh 169` → exit 0

```
eligible: #169 agent-ready labeled by <lead> (admin), author <lead> (admin)
```

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
```

R3 `gh api --paginate repos/{owner}/{repo}/issues/169/timeline --jq .[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv` → exit 0

```
labeled	agent-ready	<lead>
```

Step 2 verdict: **pass** — R1 exit 0, labeled by `<lead>` (admin); R2 1 `labeled agent-ready`; R3 agrees.

## Step 3 — lead removes `agent-ready`

R1 `scripts/agent/eligible.sh 169` → exit 1

```
eligible: #169 not labeled agent-ready
```

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
open
```

Step 3 verdict: **pass** — R1 exit 1 `not labeled agent-ready`; R2 adds 1 `unlabeled agent-ready`; R4 no labels.

## Step 4 — lead re-adds `agent-ready`

R1 `scripts/agent/eligible.sh 169` → exit 0

```
eligible: #169 agent-ready labeled by <lead> (admin), author <lead> (admin)
```

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
```

R5 per_page=1 `gh api --paginate repos/{owner}/{repo}/issues/169/events?per_page=1 --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
```

R5 per_page=100 `gh api --paginate repos/{owner}/{repo}/issues/169/events?per_page=100 --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
```

Page check: the `id`/`created_at` columns of the two R5 runs compared with `[ "$a" = "$b" ]` → `same`; the
`created_at` column through `sort -c` → ascending; `gh api …/events?per_page=1 -i` shows `rel="next"` (page 2) and
`rel="last"` (page 3), so per_page=1 crossed two page boundaries.

Step 4 verdict: **pass** — R1 exit 0; R2 labeled, unlabeled, labeled; R5 rows equal across 3 pages of one event,
`created_at` ascending, last `agent-ready` row `labeled`.

## Step 5 — lead creates label `b149-probe` and adds it to #169

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
34912366647	labeled	b149-probe	<lead>	2026-11-02T13:11:37Z
```

R3 `gh api --paginate repos/{owner}/{repo}/issues/169/timeline --jq .[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv` → exit 0

```
labeled	agent-ready	<lead>
unlabeled	agent-ready	<lead>
labeled	agent-ready	<lead>
labeled	b149-probe	<lead>
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
open	agent-ready,b149-probe
```

Step 5 verdict: **pass** — R2 adds 1 `labeled b149-probe` (id 34912366647); R4 labels `agent-ready,b149-probe`.

## Step 6 — lead renames `b149-probe` to `b149-probe-renamed`

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
34912366647	labeled	b149-probe	<lead>	2026-11-02T13:11:37Z
```

R3 `gh api --paginate repos/{owner}/{repo}/issues/169/timeline --jq .[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv` → exit 0

```
labeled	agent-ready	<lead>
unlabeled	agent-ready	<lead>
labeled	agent-ready	<lead>
labeled	b149-probe	<lead>
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
open	agent-ready,b149-probe-renamed
```

R2 single event `gh api repos/{owner}/{repo}/issues/events/34912366647 --jq [.id, .event, .label.name, .label.color] | @tsv` → exit 0

```
34912366647	labeled	b149-probe	FEF2C0
```

Re-checked about 30 s later (no caching lag): same row. Extra read-only probes, outside R1–R6, to inform the fix card:

Labels: `gh label list --search b149 --json name,id` → exit 0

```
[{"id":"LA_kwDOVaUkoc8AAAADAqP2eA","name":"b149-probe-renamed"}]
```

GraphQL (read-only query): `gh api graphql -f query=query{repository(owner:"<lead>",name:"level-up-lab"){issue(number:169){timelineItems(first:20,itemTypes:[LABELED_EVENT,UNLABELED_EVENT]){nodes{__typename ... on LabeledEvent{createdAt actor{login} label{id name}} ... on UnlabeledEvent{createdAt actor{login} label{id name}}}}}}} --jq .data.repository.issue.timelineItems.nodes[] | [.__typename, .label.name, .label.id, .actor.login, .createdAt] | @tsv` → exit 0

```
LabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:08:02Z
UnlabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:10:11Z
LabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:10:45Z
LabeledEvent	b149-probe-renamed	LA_kwDOVaUkoc8AAAADAqP2eA	<lead>	2026-11-02T13:11:37Z
```

Step 6 verdict: **fail-open (rule difference)** — the REST events (R2) and timeline (R3) keep the label's name at event
time (`b149-probe`), while the issue's labels (R4) carry the new name; no `unlabeled` or `renamed` row is added. So
`eligible.sh`, which matches R2 rows by name, can pass on an event for a different label: the lead labels issue K
`agent-ready`; a write user renames `agent-ready` away; a triage user labels K with `y`; `y` is renamed to
`agent-ready` → R4 has `agent-ready`, the last R2 row named `agent-ready` is the lead's old `labeled` → exit 0 for a
label the triage user applied. Needs a write user's rename (twice). The GraphQL `LabeledEvent.label` returns the
label's node (`id`, current name), so a fix can match the issue's `agent-ready` label by node id → fix card (D-25).

## Step 7 — lead deletes label `b149-probe-renamed`

R1 `scripts/agent/eligible.sh 169` → exit 0

```
eligible: #169 agent-ready labeled by <lead> (admin), author <lead> (admin)
```

R2 `gh api --paginate repos/{owner}/{repo}/issues/169/events --jq .[] | [.id, .event, (.label.name // ""), (.actor.login // "null"), .created_at] | @tsv` → exit 0

```
34912045315	labeled	agent-ready	<lead>	2026-11-02T13:08:02Z
34912236860	unlabeled	agent-ready	<lead>	2026-11-02T13:10:11Z
34912287105	labeled	agent-ready	<lead>	2026-11-02T13:10:45Z
34912366647	labeled	b149-probe	<lead>	2026-11-02T13:11:37Z
34912554771	unlabeled	b149-probe-renamed	<lead>	2026-11-02T13:13:40Z
```

R3 `gh api --paginate repos/{owner}/{repo}/issues/169/timeline --jq .[] | [.event, (.label.name // ""), (.actor.login // "null")] | @tsv` → exit 0

```
labeled	agent-ready	<lead>
unlabeled	agent-ready	<lead>
labeled	agent-ready	<lead>
labeled	b149-probe	<lead>
unlabeled	b149-probe-renamed	<lead>
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
open	agent-ready
```

GraphQL (read-only query): `gh api graphql -f query=query{repository(owner:"<lead>",name:"level-up-lab"){issue(number:169){timelineItems(first:20,itemTypes:[LABELED_EVENT,UNLABELED_EVENT]){nodes{__typename ... on LabeledEvent{createdAt actor{login} label{id name}} ... on UnlabeledEvent{createdAt actor{login} label{id name}}}}}}} --jq .data.repository.issue.timelineItems.nodes[] | [.__typename, (.label.name // "null"), (.label.id // "null"), .actor.login, .createdAt] | @tsv` → exit 0

```
LabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:08:02Z
UnlabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:10:11Z
LabeledEvent	agent-ready	LA_kwDOVaUkoc8AAAADAmzjTQ	<lead>	2026-11-02T13:10:45Z
LabeledEvent	b149-probe	LA_kwDOVaUkoc8AAAADAqP2eA	<lead>	2026-11-02T13:11:37Z
UnlabeledEvent	b149-probe-renamed	LA_kwDOVaUkoc8AAAADAqP2eA	<lead>	2026-11-02T13:13:40Z
```

Step 7 verdict: **pass, recorded** — deleting the label added 1 `unlabeled` row (R2/R3) named `b149-probe-renamed` (the
name at delete time), actor `<lead>` (the deleter); R4 dropped it; R1 still reads `agent-ready` only (exit 0). Safe
either way, as planned: `eligible.sh` checks current labels first, and a re-created label re-applied adds a newer
`labeled` row. GraphQL after the delete: both rows keep the same label node `id`, but now show the stored names
(`b149-probe` on `LabeledEvent`, `b149-probe-renamed` on `UnlabeledEvent`); the current name appears only while the
label exists. A fix that matches by node `id` therefore holds in both cases.

## Step 9a — lead closes #169 (label still on)

R1 `scripts/agent/eligible.sh 169` → exit 0

```
eligible: #169 agent-ready labeled by <lead> (admin), author <lead> (admin)
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
closed	agent-ready
```

Step 9a verdict: **known gap confirmed** — a closed issue still labeled `agent-ready` exits 0. `run.sh --poll` lists
only open issues, but `run.sh <n>` (`scripts/agent/run.sh:256-258`) would run it → follow-up card (D-25), outside the
Acceptance.

## Step 9b — lead removes `agent-ready` from the closed #169

R1 `scripts/agent/eligible.sh 169` → exit 1

```
eligible: #169 not labeled agent-ready
```

R4 `gh api repos/{owner}/{repo}/issues/169 --jq [.state, ([.labels[].name] | join(","))] | @tsv` → exit 0

```
closed
```

Open agent-ready issues: `gh issue list --label agent-ready --state open --json number` → exit 0

```
[]
```

Throwaway label left: `gh label list --search b149 --json name` → exit 0

```

```

Step 9 verdict: **pass** — after the unlabel R1 exits 1 `not labeled agent-ready`, R4 `closed` with no label; no open
`agent-ready` issue is left and no `b149` label exists.

## Summary

| Step | Pass line                                                   | Result                                                          |
| ---- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | R1 exit 1, not labeled                                      | pass                                                            |
| 2    | R1 exit 0, labeled by `<lead>` (admin)                      | pass                                                            |
| 3    | R1 exit 1; 1 `unlabeled` row                                | pass                                                            |
| 4    | R1 exit 0; R5 equal across 3 one-event pages, ascending     | pass                                                            |
| 5    | 1 `labeled b149-probe` row                                  | pass                                                            |
| 6    | event shows the renamed name                                | **fail-open**: old name kept → fix card                         |
| 7    | delete recorded, safe either way                            | pass: 1 `unlabeled` row, name at delete time, actor the deleter |
| 8    | author without write → exit 1                               | not run: no second account                                      |
| 9    | closed + labeled: known gap; unlabeled: R1 exit 1, `closed` | gap confirmed (follow-up); pass                                 |

Deleted actor: not produced live; `ghost` reads `read` (baseline), so it exits 1 either way.
