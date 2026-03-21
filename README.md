# Austin XBT

Say gm to [Austin XBT](https://austinxbt.devfolio.co/) — your builder mentor, Ethereum educator, and hackathon hype machine all rolled into one. Austin XBT is trained to channel the spirit (and tweets) of Austin Griffith, builder at the Ethereum Foundation and founder of BuidlGuidl, and deliver hands-on feedback on your project via a real-time voice conversation.

### Choose your Austin

<table>
  <tr>
    <td width="50%" align="center">
      <h4>Synthesis</h4>
      <p>The enthusiastic builder mentor.</p>
      <p>Sees a buidler in everyone, bursting with hackathon energy, & ready to help you ship your first prototype.</p>
      <div style="text-align: center;">
        <img src="/assets/happy-austin.gif" width=150px>
      </div>
    </td>
    <td width="50%" align="center">
      <h4>Tough Love</h4>
      <p>The tough-love builder mentor.</p>
      <p>Demands you understand the fundamentals, challenges every assumption, & believes great builders explain things simply.</p>
      <div style="text-align: center;">
        <img src="/assets/skeptical-austin.gif" width=150px>
      </div>
    </td>
  </tr>
</table>

---

## Architecture

- **Agent (`agent/`)** — LiveKit Voice Agent powered by OpenAI, with ElevenLabs voice cloning and Bonfires knowledge retrieval.
- **Client (`client/`)** — Next.js web app providing the voice UI via LiveKit, with optional x402 micropayment gate and Zora minting.

## Getting Started

### Prerequisites

- Node.js and [pnpm](https://pnpm.io/) (for the client)
- Python and [uv](https://github.com/astral-sh/uv#installation) (for the agent)
- A [LiveKit Cloud](https://cloud.livekit.io/) project (or self-hosted LiveKit server)

### Setup

1. **Agent**

   ```sh
   cd agent
   cp .env.example .env
   # Fill in: LIVEKIT_*, OPENAI_API_KEY, ELEVEN_API_KEY, DEEPGRAM_API_KEY, etc.
   make install
   make download-files
   ```

2. **Client**

   ```sh
   cd client
   cp .env.example .env.local
   # Fill in: LIVEKIT_* and any optional features (see below)
   pnpm install
   ```

### Running

```sh
# Terminal 1 — Agent
cd agent && make dev

# Terminal 2 — Client
cd client && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Optional Features

### Zora Minting

Let users mint their project idea as a coin on Zora. Requires:

```env
NEXT_PUBLIC_ENABLE_ZORA_MINTING=true
NEXT_PUBLIC_PROJECT_ID="<reown-appkit-project-id>"
INFURA_API_KEY="<infura-key>"
INFURA_API_SECRET="<infura-secret>"
```

Set `NEXT_PUBLIC_ENABLE_ZORA_MINTING=false` to disable.

### x402 Payment Gate

Gate voice sessions behind a USDC micropayment using x402. Requires:

```env
NEXT_PUBLIC_DELVE_API_URL="https://api.delve.bonfires.xyz/"
VOICE_SESSION_JWT_SECRET="<random-secret>"
NEXT_PUBLIC_PAYMENT_DEFAULT_AMOUNT="1.00"
```

### Voice Cloning

To create your own voice clone using ElevenLabs, follow their guide:
https://elevenlabs.io/blog/how-to-clone-voice

Set the resulting voice ID in the agent's `.env`:

```env
ELEVEN_VOICE_ID="<your-voice-id>"
```

---

## Contributing

Feel free to open [issues](https://github.com/devfolioco/austingpt/issues/new/choose) and [pull requests](https://github.com/devfolioco/austingpt/pulls)!

### Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://swarnimwalavalkar.com/"><img src="https://avatars.githubusercontent.com/u/38808472?v=4?s=100" width="100px;" alt="Swarnim Walavalkar"/><br /><sub><b>Swarnim Walavalkar</b></sub></a><br /><a href="https://github.com/devfolioco/austingpt/commits?author=SwarnimWalavalkar" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://prathamvaidya.in"><img src="https://avatars.githubusercontent.com/u/61202986?v=4?s=100" width="100px;" alt="Pratham Vaidya"/><br /><sub><b>Pratham Vaidya</b></sub></a><br /><a href="https://github.com/devfolioco/austingpt/commits?author=prathamVaidya" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://preetjdp.dev/"><img src="https://avatars.githubusercontent.com/u/27439197?v=4?s=100" width="100px;" alt="Preet Parekh"/><br /><sub><b>Preet Parekh</b></sub></a><br /><a href="https://github.com/devfolioco/austingpt/commits?author=preetjdp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://faradayfury.webflow.io"><img src="https://avatars.githubusercontent.com/u/126873863?v=4?s=100" width="100px;" alt="Anish Dhiman"/><br /><sub><b>Anish Dhiman</b></sub></a><br /><a href="#design-faradayfury" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://bio.link/ashwinexe"><img src="https://avatars.githubusercontent.com/u/53075480?v=4?s=100" width="100px;" alt="Ashwin Kumar Uppala"/><br /><sub><b>Ashwin Kumar Uppala</b></sub></a><br /><a href="https://github.com/devfolioco/austingpt/commits?author=ashwinexe" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

[![License](https://img.shields.io/github/license/devfolioco/austingpt#reload)](https://github.com/devfolioco/austingpt/blob/main/LICENSE)
