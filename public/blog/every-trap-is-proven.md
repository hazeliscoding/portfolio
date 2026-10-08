---
title: Every trap is proven: building an agent skill you can trust
date: 2026-10-08
description: What a coding agent gets wrong porting SDL2 to SDL3, how I measured it, and the agent that searched the whole disk for headers.
tags: [claude-code, agent-skills, sdl3, evals, c]
---

This compiles against SDL3 without a single warning:

```c
if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) != 0) {  // SDL3 returns true on success
    SDL_Log("SDL_Init failed: %s", SDL_GetError());
    return 1;                                          // so this runs on every launch
}
```

In SDL2, `SDL_Init` returned 0 on success. In SDL3 it returns `true`. The line looks the same, the compiler is happy, and the game quits every time it starts.

SDL3 is full of changes like that. An audio stream now opens paused, so the game is silent. Textures filter linearly by default, so pixel art comes out blurry. A texture with an alpha channel now blends, so an emulator's screen can go invisible. SDL's rename scripts handle most of a port and the compiler catches most of the rest, but neither one catches code that still compiles and now means something else. Coding agents make exactly these mistakes, because most of the SDL code they learned from is SDL2.

So I built [sdl3-porter](https://github.com/hazeliscoding/sdl3-porter), a Claude Code plugin that ports C and C++ from SDL2 to SDL3 and catches those changes. This post is less about the plugin than about the question I kept asking while building it: how do I know it works?

![Claude Code loads sdl3-porter, ports a small SDL2 game, builds and runs it, and reports each trap it fixed by file, line and trap id](/images/blog/every-trap-is-proven/port.gif)

## What counts as a trap

I gave myself a strict definition. A trap is a change that compiles against SDL3 with warnings as errors (`-Wall -Wextra -Werror` on GCC and Clang, `/W4 /WX` on MSVC) and then breaks at runtime. If any compiler warns about it, the compiler already catches it, and it goes in a reference file instead.

A trap also doesn't count until it's proven. Each one has three small C programs:

- the **SDL2 original**, which must pass against SDL 2.32;
- the **naive port**, the code an agent would write, which must compile cleanly and then **fail**;
- the **fixed port**, which must pass.

CI builds all three and runs them headless on Windows, Linux and macOS, against SDL 3.4.18 and the oldest supported 3.2.0. Headless means no display, no sound card and no gamepad: the offscreen video driver, dummy audio, SDL's virtual joystick and the software renderer.

The naive port is the important one. It's the positive control. If it ever stops failing, the trap is no longer proven, and CI goes red. It also has to fail for the right reason: it must print one line that starts with the trap's id, like `bool-returns: SDL_Init reported failure`, so a setup error can't pass for the trap.

That rule threw out a lot of good ideas. Nintendo face buttons, rumble, exclusive fullscreen and high DPI all change in SDL3, but none of them can be proven without real hardware. They became 12 sections of guidance that the agent checks by reading the code. The 17 traps are only the changes I could make fail on demand.

Proving things headless had its own traps. The vsync fixture can't time frames, because SDL2's software renderer reports vsync as on and never actually waits. It checks the renderer's state instead.

## Measuring it

A trap card tells the agent what to look for. That doesn't mean the agent finds it. For that I used evals: run Claude Code on an SDL2 program, let it port the code, then check the result.

Two rules made the scores worth believing.

**Don't port the fixture.** The fixture's SDL2 original checks the exact behavior the trap is about, which points straight at the answer. Each eval ports a separate sample instead: a plausible little SDL2 program with a neutral name and no self-checks. One more case ports a whole game, where the agent has to find the traps itself.

**Every grader has to be able to fail.** Most graders are a regular expression over the ported files that checks one trap fixed or one porting step done. A test runs every trap grader against a port made only with SDL's rename scripts, and fails if any of them passes it. A grader that can't fail measures nothing.

Each case runs five times with the skill and five times without it, on Sonnet 5 and Haiku 4.5. I also wrote down the rules for messy results before I had any. An infrastructure error gets one traced rerun, and a second error counts as measured. Hitting the turn limit is a real result. No threshold ever gets lowered. When a new Claude Code release shipped in the middle of a batch, I pinned the version and reran the cases that had mixed versions, so one table never mixes two versions.

## What the numbers say

![Eval scores with and without sdl3-porter for each case, on Sonnet 5 and Haiku 4.5](/images/blog/every-trap-is-proven/scores.svg)

Without the skill, Sonnet 5 already gets 10 of the 17 traps right every time. On the other 7 it scores between 0.00 and 0.47. With the skill it scores 1.00 on all of them.

The skill doesn't help much with what the model already knows. It helps with silent default changes, where the SDL2 code looks perfectly fine: textures that now blend, textures that now filter, audio that SDL2 started by itself and SDL3 doesn't. Sonnet scores 0.00 on all three of those without the skill.

Finding is harder than fixing. In an early run, `text-input-off` scored 1.00 without the skill as a small standalone sample. In the whole game, the same model missed it in 3 runs out of 3. One trap in a small file is easy to spot. One trap in a game is easy to miss.

The smaller model gains more. On the whole game, Haiku 4.5 went from 0.39 without the skill to 0.92 with it. It isn't perfect, though. It scores 0.40 on `window-mode-null`, where it keeps the old call behind a NULL check and calls that a fix, and 0.80 on `logical-scale-separate`. I shipped 1.0 with both listed as known gaps instead of running the evals until they looked better.

Without the skill, scores also move between runs. `linear-by-default` scored 0.33 in one run and 0.00 in the next. Five runs per case is a small sample, so I read the table as "reliably fixed" versus "sometimes missed", not as exact percentages.

## The agent that searched the whole disk

The first smoke run took 785 seconds with the skill and 43 without. The skill was making the agent much slower.

A traced rerun showed why. The agent spent 87 seconds on one command: `find /`, looking for `SDL_video.h` so it could check its port against the SDL3 headers. I added a line to the skill telling it not to search for headers. In the first full eval run, one run hit the 1,200-second timeout anyway. A traced rerun showed the agent running `find / -xdev -iname SDL3.h` for 120 seconds, even though the skill had told it not to.

The fix was to stop asking for the behavior and remove the reason for it. The skill now ships with the 66 SDL3 headers it needs, 2.3 MB of them. The slowest run dropped from 1,200 seconds to 342.

Then it happened again. After dogfooding, I added a step telling the agent to build the port where it could. Three runs took 746, 808 and 1,130 seconds. This time the agent was searching the disk for an *installed* SDL3, its library or its CMake files, to decide whether it could build. My rule only covered headers, so this search wasn't against it.

The rule that finally held was about the action, not the target: don't run `find` or `locate` outside the project, and ask the build instead, with `pkg-config --exists sdl3` or by configuring the project. In the same nine runs, the agent searched outside the project zero times, and the slowest run took 202 seconds.

A rule against one target invites a search for the next one. A rule about the action covers the next target too.

## Facts in the output beat rules in the docs

For 1.0, I added a script, `find_traps.py`, that runs every trap's search over the project in one command. Writing it found a bug of its own: seven searches never matched pointer access such as `ev->gbutton.button`, so they had silently skipped some real code.

The script also prints facts next to its hits. When it sees an old SDL2 hint name, it prints "removed in SDL3" beside it. Before that, Haiku left the dead hint in the whole game in 5 runs out of 5. In a check after the change, it left it in 1.

Rules in the docs did worse. One trap card says in plain words that a NULL check is not a fix. Haiku read that card and then called a NULL check "no change needed". The traces also showed why small models miss things: Haiku reads files with a line limit, 80 to 150 lines at a time, so a trap card near the bottom of a long reference file sometimes doesn't get read at all.

## Against the maintainers

Evals use programs I wrote. To test against real code, I ported open-source projects starting from the commit just before their maintainers did their own SDL3 port, then compared the two ports.

An early comparison found a trap I didn't have. A Game Boy emulator's maintainer had fixed a texture that SDL3 now blends by default, which made the whole screen invisible. The agent's port had missed it. It became `blend-by-default`, the trap Sonnet scores 0.00 on without the skill.

The larger ports:

| Program | Size | Cost | Result |
|---|---|---|---|
| Woof!, a Doom source port | about 165,000 lines | $15.34, 91 min | builds clean, plays a demo headless |
| scrcpy | about 31,000 lines | $12.44, 22 min | builds clean, unit tests pass |

Both had misses. In scrcpy, the agent's own search found the text input code, and then it never turned text input on. Both agents ran every search at once and skimmed past hits. Now the skill asks for a verdict on every section that has hits. Woof!'s menu turned up a mouse-mapping bug in letterboxed windows, which became the 17th trap, `logical-scale-separate`. The maintainers' own port has the same bug.

The agent also beat the maintainers twice. scrcpy's own port sent a loop index in gamepad events where SDL3 expects a joystick ID, and the agent's port sent the ID. Woof!'s port kept the `__MACOSX__` macro, which SDL3 no longer defines, so some macOS-only code silently stopped building. The agent had renamed it to `SDL_PLATFORM_MACOS`. I reported that one as [woof#2952](https://github.com/fabiangreffrath/woof/issues/2952). A contributor opened a fix within hours, and I checked the fix's macOS build without a Mac, by comparing strings in the binaries.

Every dogfood report also overcounted. One listed 6 traps where there was 1. Later, the port I recorded for the README flagged `blend-by-default` on a sprite whose pixels were all opaque, because the card's wording allowed it. The agent follows what the card says, not what I meant, so the cards got stricter.

## How it was built

I built sdl3-porter with Claude Code itself. The repository's `AGENTS.md` holds the rules from this post: no trap without a naive port that fails, cite SDL's migration guide for every trap, never lower a threshold, and test every check that looks for an absence against a case where it should fail. Most of what's above is what happened when those rules met the evidence.

## Try it

In Claude Code:

```text
/plugin marketplace add hazeliscoding/sdl3-porter
/plugin install sdl3-porter@sdl3-porter
```

Then open an SDL2 project and ask Claude Code to port it to SDL3. Commit first, because the port is meant to be reviewed as a diff. The [README](https://github.com/hazeliscoding/sdl3-porter#readme) has the full eval table and the known gaps, and [ROADMAP.md](https://github.com/hazeliscoding/sdl3-porter/blob/main/ROADMAP.md) records every decision, with its date.
