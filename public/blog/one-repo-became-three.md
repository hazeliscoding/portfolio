---
title: One repo became three: keeping a preservation port honest
date: 2026-10-20
description: Puzzle Boy's 30 unplayed stages, the switch key they needed, and why that key ended up in a different repo from the port. Part 2 of 3.
tags: [puzzle-boy, claude-code, csharp, monogame, architecture]
---

Puzzle Boy ships 50 stage files and plays 20 of them. The 30 it never plays include all seven stages with more than one Jack-o'-Lantern, and six of those can't be finished at all.

This is part 2 of 3. [Part 1](/blog/a-ps2-minigame-in-a-unity-remaster) covered reading the rules out of *Shin Megami Tensei III Nocturne HD Remaster* and rebuilding the minigame as [puzzle-boy](https://github.com/hazeliscoding/puzzle-boy). This one covers what I did with the unplayed stages, how that broke the port's one promise, and how splitting it into three repos fixed it.

## The stages nobody played

Part 1 said 21 of the 50 files are played. The code does list a 21st, file 00, for "levels 2 and 3", but every video and guide ends after stage 20, so I count 00 as unused.

None of the 30 is junk. Every start and goal is on floor, no goal is walled off, and a few are tutorial-sized, at 3 or 4 pushes. They include all seven multi-character stages and the six files damaged by the line-ending conversion.

The multi-character ones are where it gets strange. In the original, control passes to the next Jack only when one reaches the goal. Nothing else switches, so the first Jack has to get home alone, using only its own pushes. A search ran out of positions on six of the seven. File 05 shows why: one push can only be made from a dead-end alcove that the block itself seals off, so somebody has to wait in that alcove while another character brings the block over.

They look like stages designed for a switch the shipped code doesn't have. That's my guess, not something the code says.

## A switch key and a search

So the port got a switch key, C. It passes control to the next visible character, in the same order a goal arrival does. Its label on the controls bar, "Switch Character", is the game's own guide text. With it, four of the six stuck stages have solutions, and file 47 needs all four Jacks and 10 switches.

Then a search went through all 30 files. It made every move on the port's real `Board`, built from the real file, so no solution could lean on a rule the port doesn't have. Breadth-first search found the fewest pushes, and A* took over when the space got big. A faster second pass had its rules checked against the real `Board` on 4.7 million single steps before I trusted it, and every solution was replayed input by input on a fresh board before anything shipped.

| The 30 unused files | |
|---|---|
| Solved as shipped | 19 |
| Solved with the switch | 4 |
| Not settled | 7 |
| Proved unsolvable | 0 |

A stage only counts as unwinnable when the search runs out of positions. The seven unsettled ones hit the search budget, which proves nothing either way. Of the 23 solutions, 19 are proved shortest.

The 23 shipped in [v0.2.0](https://github.com/hazeliscoding/puzzle-boy/releases/tag/v0.2.0) as stages 21 to 43, easiest first, with PageUp and PageDown to skip around.

![Stage 34 in the port, a bonus stage with several Jack-o'-Lanterns, cleared by switching between them](/images/blog/one-repo-became-three/four-jacks.webp)

It worked. It also meant the "faithful port" now had a key, a controls-bar label and 23 stages the original never had.

## Three repos, one rule each

A preservation port shouldn't contain things the original lacks. But the bonus stages and the switch were good, and I didn't want to throw them away. So I stopped asking one repo to do both jobs:

| Repo | Its one rule |
|---|---|
| [puzzle-boy-engine](https://github.com/hazeliscoding/puzzle-boy-engine) | The rules, stage authoring, and later the code both games share. Not a game. |
| [puzzle-boy](https://github.com/hazeliscoding/puzzle-boy) | The original's scope only: its 20 stages, in its order, from your own files. |
| [puzzle-boy-community](https://github.com/hazeliscoding/puzzle-boy-community) | Anything new: stage select, an editor, level packs, the bonus stages and the switch. |

Both games pin the engine as a git submodule at a fixed commit. An engine change lands there first, then each game bumps its pin on purpose. There's no package feed and no floating `main`, so an engine change reaches a game only when that game asks for it.

`Board.Switch` stayed in the engine, since Community uses it. The port just never calls it.

## Proving nothing changed

The split itself was mostly moving files. The work was proving the port was still the port.

Before touching anything, I tagged the last commit `pre-split-baseline`: a clean build and 164 passing tests. Then:

- **The rules moved with their tests.** 86 of the 164 tests went to the engine with the rules, unchanged but for their namespace.
- **The stage list is pinned.** A test checks that the port plays exactly the 20 documented files, each once, with none of the 23 bonus files, and that it loads only those 20 from a bundle holding all 50.
- **The switch can't come back by accident.** A test scans the game's compiled metadata for any call to `Board.Switch`. A scan for an absence proves nothing on its own, so the same scanner must also find `Board.Step`, which the game does call.

Later, Community needed the original's look too (that's part 3), so the board renderer, Jack's model, the camera, the move timing, the sound and the bundle reading moved from the port into the engine. The rule for that move was verbatim. Each moved file was diffed against the last commit before the move: 12 files and 1,889 lines, of which 34 changed. Every change was a namespace, an `internal` that became `public` because a game now uses it, or a citation that now names the port's roadmap. No statement, constant or expression changed, so the port can't play or look any different. The HUD, menus and text renderer followed the same way: 1,081 lines, 19 changed.

## Community Edition had to play without Nocturne

If you own Nocturne, you import it once, and Community Edition plays every stage in the original's look and sound: its board, its Jack-o'-Lantern, its camera, its music. Your copy's stages come along too, as two more campaigns: the original 20 and the 23 bonus stages.

![Community Edition's stage select with a copy of Nocturne imported, in the original's style, with the Classic: Original 20 and Classic: Bonus campaigns beside First Steps](/images/blog/one-repo-became-three/classic-stage-select.jpg)

How it got that look is part 3. It also had to work for everyone without a copy. The port needs one, and if Community did too, it would just be the port with extras. So its first rule, written into its roadmap, is that an unpacked release starts on a machine with no Nocturne, no Steam, no .NET, no network and no dev checkout, and reaches a playable stage. It never opens on a missing-assets screen.

Without a copy, the Default theme takes over: Pixel Jack, a pumpkin in a witch's hat, with art and sound drawn and synthesized in code. The builds are self-contained, so there's nothing to install first. Here are the same two screens each way:

<figure class="pair">

![The title screen with a copy imported, with the original Jack-o'-Lantern](/images/blog/one-repo-became-three/classic-title.jpg)

![The title screen without one, with Pixel Jack in his witch's hat](/images/projects/puzzle-boy/title.png)

<figcaption>The title screen: with your copy, then without one</figcaption>
</figure>

<figure class="pair">

![Garden Path with a copy imported, with the original HUD and key prompts](/images/blog/one-repo-became-three/classic-garden-path.jpg)

![Garden Path without one, in the Default theme, after one step](/images/projects/puzzle-boy/playing.png)

<figcaption>Garden Path, the first stage: with your copy, then without one</figcaption>
</figure>

It also needed stages of its own. Community ships 20 new ones in a pack called First Steps, made by designer agents with a breadth-first solver and curated into a difficulty curve: a walk, a first push, holes, long blocks, swivels and a switch tutorial. They take from 7 inputs to 161, and every one has a recorded solution that the tests replay to a clear.

The editor builds on the stage-authoring API that came with the engine, which reports problems with coordinates, so a broken stage says where it's broken:

![Community Edition's level editor flagging a block group split at (3, 6)](/images/projects/puzzle-boy/editor.png)

## Keeping Nocturne's layouts out

An editor and level packs raise an obvious question: what stops someone from converting one of Nocturne's 50 stages to JSON, mirroring it, and sharing it as their own?

Fingerprints. `LayoutFingerprint` hashes a stage's cropped grid in its smallest rotation or mirror, so turning, flipping or shifting a layout doesn't change it. Each of the 50 Nocturne stages gets two, with and without the goal and starts, and only those 100 SHA-256 hashes are in the repo, generated outside it from a local install. Community's tests fail if a bundled stage matches one, the pack importer refuses a matching stage, and without the list beside the game nothing is imported or exported at all.

The bonus stages live on in Community the way the port works: imported from your own install, on request. They never ship.

## What the reviews caught

Every milestone ended with adversarial reviewers who tried to break it. Some favourites:

- Linux crashed at startup when the GL driver had no multisampling.
- Turning on fullscreen caused a stack overflow through a resize handler.
- A save file with a duplicate JSON key crashed startup.
- A 115-byte fake bundle header made the classic import allocate until it ran out of memory.

## Where it ended up

Both games shipped on October 15. [puzzle-boy v0.3.0](https://github.com/hazeliscoding/puzzle-boy/releases/tag/v0.3.0) plays the original's 20 stages on the shared engine, and nothing else. [Community Edition v0.1.0](https://github.com/hazeliscoding/puzzle-boy-community/releases/tag/v0.1.0) runs on Windows, Linux and macOS, Apple Silicon and Intel. Its release job only publishes once every platform's smoke test passes; on macOS and Linux that means a real window opened, drew the title and stage 1, and took a step.

Then I changed my mind about how Community should look. That's part 3.
