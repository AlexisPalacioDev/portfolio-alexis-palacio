# Extraction Survivors

2D browser multiplayer (up to 4 players) extraction-looter with
Vampire-Survivors-style hordes.

## Architecture decisions

- **Networking**: host-client (P2P) over WebRTC DataChannels + a minimal
  signaling server. One player hosts and simulates; others connect. Caveat:
  the host is authoritative-by-trust — migrate to a dedicated authoritative
  server if competitive/public play is ever needed.
- **Rendering**: PixiJS (WebGL) for render only; the game loop, collisions,
  and ECS are hand-written. Chosen to learn the fundamentals and to keep full
  control over horde performance.
- **Characters**: procedural pixel-grid creatures (ported in spirit from the
  portfolio "Bug Hunt" bug), rasterized once to a canvas and cached as PixiJS
  textures so hundreds can render on the GPU.

## Workspace layout

```
packages/
  creatures/  procedural creature generation (grid -> canvas -> texture)
  shared/     framework-free simulation core (fixed-timestep loop, later: ECS)
  client/     PixiJS render, input, the runnable app (Vite)
  signaling/  WebRTC signaling server (added in the networking phase)
```

`shared` and `creatures` are intentionally free of PixiJS so the simulation
can be shared between host and clients.

## Roadmap

0. **Scaffold** — monorepo + TS + Vite + PixiJS drawing a moving creature. ✅
1. **ECS + fixed timestep** — one player that walks. ✅
2. **Hordes** — spawner + spatial grid + collisions. ✅
3. **Combat & loot** — Vampire-Survivors-style auto-attack + ground loot. ✅
4. **Extraction** — exit zone (hold to extract); lose loot on death. ✅
5. **Netcode** — WebRTC host-client, up to 4 players, snapshot streaming. ✅

## Controls

WASD / arrow keys to move. The weapon auto-fires at the nearest enemy. Walk
into the blue circle and hold to extract (banks your loot). Die and you lose
everything you were carrying.

## Multiplayer (host-client over WebRTC)

1. Start the signaling server: `pnpm signaling` (listens on `ws://localhost:8080`).
2. Start the client: `pnpm dev`.
3. Host opens `http://localhost:5173/?host&room=lobby`.
4. Each player opens `http://localhost:5173/?join&room=lobby`.

The host runs the authoritative simulation and streams snapshots; clients send
input and render. Use the same `room` value to join the same game.

> **Note:** the host's loop is driven by `requestAnimationFrame`, which browsers
> throttle in **background tabs** — so the host window must stay focused while
> playing. (Fine in practice: the host is a player.)

## Getting started

```bash
pnpm install
pnpm dev      # starts the client on http://localhost:5173
pnpm build    # production build of the client
```
