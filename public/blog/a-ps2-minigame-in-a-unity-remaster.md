---
title: Digging a 2003 PS2 minigame out of a 2021 Unity remaster
date: 2026-10-18
description: Rebuilding Puzzle Boy from Shin Megami Tensei III Nocturne as a standalone game, from the game's own code but without shipping a byte of it. Part 1 of 3.
tags: [reverse-engineering, puzzle-boy, claude-code, ghidra, csharp, monogame]
---

The method names in *Shin Megami Tensei III Nocturne HD Remaster* read like a PS2 source tree from 2003:

```text
pbGame.pushCheck      pushing a block
pbGame.roundCheck     turning a swivel block
pbGame.hallCheck      falling into a hole (yes, "hall")
pb_H                  the old pb.h header, now a C# namespace
pbEdit                the developers' level editor, still in the build
```

That's Puzzle Boy, a minigame deep inside Nocturne. You guide Jack-o'-Lantern through a maze by pushing blocks, turning swivel blocks and filling holes, while the Manikin Kid taunts you. It's Atlus's old Game Boy puzzler (Kwirk in the West), redone in 3D. I wanted it as a game of its own that runs anywhere, so I rebuilt it: [puzzle-boy](https://github.com/hazeliscoding/puzzle-boy).

![Jack-o'-Lantern turns the view, switches to the overhead camera and undoes a push from the menu, in the port](/images/blog/a-ps2-minigame-in-a-unity-remaster/tour.webp)

This is part 1 of 3. It covers the first two days: reading the rules out of the game, the line I drew around its copy protection, and how the rules became tests before they became code. [Part 2](/blog/one-repo-became-three) is about the stages the original never plays, and how one repo became three.

## The rules I started with

Before writing any code, I wrote down what the project would never do, in the repo's `AGENTS.md`, so every agent session starts with it:

- **No Atlus data in the repo.** No stages, text, audio, textures, models, metadata dumps or decompiler output. The game reads all of it from your own install at startup.
- **No decompiled code in the source.** Every rule found in the game becomes a test on a handmade stage first, and the code is written from the test.
- **No circumvention.** More on that below.

I built it with Claude Code doing the reverse engineering through [REA](https://rea.tools) and Ghidra, and me deciding.

## The metadata talks first

The HD Remaster is a Unity 2019 game compiled with IL2CPP: C# turned into a 383 MB native `GameAssembly.dll`. IL2CPP keeps every class, method and field name in a separate file, `global-metadata.dat`, and Nocturne's isn't encrypted.

So before decompiling anything, a small parser read 5,378 type definitions. The Puzzle Boy classes were all there, with the names from the list above. `pbGame` alone has 74 fields and 60 methods. Nearby were `sdfChipFreeDelayed`, `dds3PrimFrameRect`, and `mcSave` for the PS2 memory card. The remaster is the 2003 C code, converted to C# and kept nearly as it was. The help text still documents the developers' edit mode, translated into eight languages, and the debug menu has a "PUZZLE BOY GAME" entry next to "MODEL VIEWER".

![The Manikin Kid explains the goal before stage 1: "Do you see that spinning blue cube? That's the goal."](/images/blog/a-ps2-minigame-in-a-unity-remaster/manikin-kid.jpg)

## Six files broken by a line ending

The stages are 50 files in a Unity bundle called `pazzleboy` (Atlus's typo). Each is 828 bytes: a character count, four start positions, a goal, then a 20×20 grid of 16-bit cells. `0x2000` is a wall, `0x0800` a hole, `0x60nn` part of block group `nn`, and swivels have their own pair of types.

Six files were a few bytes longer. In one of them, the character starts at y = 2573 on a 20-row grid.

Each of the six had exactly as many `0D 0A` byte pairs as extra bytes. Somewhere in Atlus's pipeline, a line-ending conversion treated these binary files as text and turned every `0A` byte into the Windows `0D 0A`. Undo it, and every file is 828 bytes again and makes sense. The broken one starts its character at (17, 10).

![The port's first render: stage file 44, one of the six damaged files, drawn as plain boxes after the repair](/images/blog/a-ps2-minigame-in-a-unity-remaster/first-render-stage-44.jpg)

The code later explained why nobody ever noticed: the original never loads those six files. The port repairs them anyway, and its `.gitattributes` marks stage files as binary, so the same thing can't happen to me.

## The line around Denuvo

`GameAssembly.dll` is protected by Denuvo Anti-Tamper. I wasn't going to dump the running game's memory, de-obfuscate anything or patch it. What made the project possible at all was one check: all 225 Puzzle Boy methods live in the unprotected `.text` section, along with 13,002 of the game's 13,028 methods. The protected code is a separate 316 MB section.

So the rule is short: read only unprotected code, statically. If a question leads into protected code, answer it by playing the real game instead.

The usual tools didn't make it easy. REA couldn't open Unity bundles and had no IL2CPP support. Il2CppDumper couldn't find IL2CPP's registration tables, because the protector had renamed the sections that hold them. Found by hand, the tables turned out to use the v24.3 layout while the metadata claimed v24.2, and the dumper crashed on that too. So a script of about 100 lines followed each method's token to its address and wrote 13,028 names into a seed file for Ghidra.

## Ghidra versus a 32 GB laptop

Then Ghidra had to analyze 383 MB of native code. The first run died about 12 minutes in, when the agent's session ended and took its background job with it. The second was launched outside Claude Code's process tree. After 52 minutes, Java held 11.4 GB and the machine had 0.1 GB of RAM free. I stopped it.

The overnight run spent 6.5 hours looping through the protected section without finishing. Denuvo's code is virtualized, so there's nothing readable there anyway; Ghidra was just wading through it.

So I made a local analysis copy of the DLL with the protected sections emptied. `.text` stayed byte-identical, and every address still lined up with the seed file. Nothing was defeated and nothing ran: it just removed the protected code from what Ghidra looked at. The analysis finished in **41 minutes**.

One beat I like: the agent then tried to commit that trimming script to the public repo, and Claude Code's own safety check refused. A public script that strips sections from a Denuvo-protected binary reads as anti-DRM tooling, whatever it's for. I agreed. The script and the copy stayed on my machine, and the explanation went here instead.

## Reading the rules, with an adversary

The research ran as one batch: seven agents each read one area of the decompiled code (pushing, swivels, the turn loop, stages, loading, undo, presentation), and for each one, a second agent re-checked every claim against the pseudocode and tried to prove it wrong. Then a critic looked for what was missing.

| The research batch | |
|---|---|
| Agents | 15 |
| Tool calls | 1,055 |
| Claims made | 111 |
| Confirmed | 97 |
| Refuted or corrected | 10 |
| Left uncertain | 4 |

The findings went into the public `ROADMAP.md` as plain-language rules, each with a short evidence ID, and never as pseudocode. A few surprises:

- **Only 21 of the 50 stage files are ever played.** Level 1 is 20 stages in a fixed order. The six damaged files are among the unused ones.
- **There's no move counter.** The only number on screen is the stage counter.
- **Undo keeps 30 steps and only records pushes and turns.** Undoing throws away any walking since the last push.
- **The original has a real bug:** its character-collision check swaps x and y. It never matters, because every played stage has exactly one character.

## Rules as tests

Every rule then became a test on a stage drawn as text. Columns are x and rows are y, and a helper turns the drawing into real 828-byte stage bytes, so every test also goes through the parser:

```text
#2##
1a..
#o##
#G##
```

`#` is a wall, `.` floor, `o` a hole, `G` the goal, digits are characters and lowercase letters are block groups. The expected result is just another drawing.

To check the tests had teeth, I broke the engine on purpose nine ways: reverse the swivel's turning sense, skip the fall into a hole, drop the sweep check, set the undo limit to 31, and so on. Every mutation failed at least one test. Reversing the swivel sense failed 22.

![The original's □ menu in the port, with UNDO taking back a push](/images/blog/a-ps2-minigame-in-a-unity-remaster/menu-undo.jpg)

## 2,756 inputs, and the board was upside down

Tests prove the code matches what I read. They don't prove I read it right. For that I needed the real game's solutions.

AppMedia publishes the full input list for every stage of the HD version. Parsed into left, right, up and down and replayed in the port, they cleared all 20 stages: **2,756 inputs, each stage clearing exactly on its last one, with none refused.**

Except at first, they didn't. Stage 1's solution only worked under one of the eight possible ways to map screen directions onto the grid, and it wasn't the port's. Gameplay video showed why: the original draws +y going *up* the screen. The port drew it down, so every stage was a mirror image and swivels seemed to turn the wrong way. The rules were right; only the picture was flipped. After a one-line fix, the same mapping cleared all 20.

## Measuring the clock from video

The original runs one tick per rendered frame, so its speed depends on your frame rate. A 144 Hz monitor plays it faster. The code can't tell you what "normal" is.

Gameplay video can. In 60 fps footage, every move lasts a multiple of 8 frames, and stage 1's five-cell walk lasts exactly 40. That's 4 ticks a step at 30 ticks a second, which is what the port runs. Even the extra tick after a swivel turn shows up as a 2-frame pause.

## Making it look like the real thing

The rest of the first two days went into the original's look, all read from the player's install at startup: the board textures (DXT1, decoded on the CPU), the backdrop, Jack-o'-Lantern's skinned model and idle animation, the sound effects and music (FMOD banks with Vorbis inside), the HUD, the □ menu and the Manikin Kid's lines.

The game ships no font file. Its text exists only as TextMeshPro distance-field atlases, so the port runs TextMeshPro's shader math on the CPU to draw it.

![COMPLETE! in the port, after the last push of a stage](/images/blog/a-ps2-minigame-in-a-unity-remaster/complete.jpg)

Before polishing, a review compared the port's timing against the research and the footage and found 12 real differences. The overhead view turns in 12 ticks, not 9. The camera orbits a point a quarter cell below Jack. The next stage loads 35 ticks after the winning input. And the original reads no input at all while a move plays, so a key pressed then is lost, not queued.

## Keeping it honest

"No Atlus data in the repo" is a rule an agent can break by accident, so CI checks it. A script inspects every tracked file by its first bytes for Unity bundles, FMOD sound banks, IL2CPP metadata and Atlus flow scripts. It also rejects stage files outside the tests and Ghidra's generated names in the source.

A check for an absence proves nothing until you see it fail, so it has a positive control that plants each kind in a scratch repo and expects a failure. I also opened a throwaway pull request with a 4-byte stage file in it. CI failed exactly where it should, and the PR was closed unmerged.

Two mistakes worth admitting. To take screenshots of other stages, the agent once sent keystrokes to the game, while Windows was keeping focus on whatever window I had open. And the first frame-capture tool played the game's music on my speakers. Both tools now run the game with no real input and no sound.

![Stage 20, the last stage, in the port](/images/blog/a-ps2-minigame-in-a-unity-remaster/stage-20.jpg)

## Where it ended up

[v0.1.0](https://github.com/hazeliscoding/puzzle-boy/releases/tag/v0.1.0) shipped about 24 hours after the first question. It has Windows, Linux and macOS builds, all 20 stages, and the original's look, timing, sound, HUD, dialogue and menu, read from your own copy. You need *Shin Megami Tensei III Nocturne HD Remaster* to play it, and the repository holds none of it.

Then I looked at the 30 stage files the original never plays, and found that six of them can't be won as shipped. That's [part 2](/blog/one-repo-became-three).
