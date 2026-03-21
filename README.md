# AustinGPT

### Choose your Austin

<table>
  <tr>
    <td width="50%" align="center">
      <h4>AustinGPT</h4>
      <p>The enthusiastic builder mentor.</p>
      <p>Sees a buidler in everyone, bursting with hackathon energy, & ready to help you ship your first prototype.</p>
      <div style="text-align: center;">
        <img src="/assets/mellow-austin.gif" width=150px>
      </div>
    </td>
    <td width="50%" align="center">
      <h4>Tough Love AustinGPT</h4>
      <p>The tough-love builder mentor.</p>
      <p>Demands you understand the fundamentals, challenges every abstraction, & believes great builders explain things simply.</p>
      <div style="text-align: center;">
        <img src="/assets/critical-austin.gif" width=150px>
      </div>
    </td>
  </tr>
</table>

Say gm to [AustinXBT](https://austinxbt.devfolio.co/) — your builder mentor, Ethereum educator, and hackathon hype machine all rolled into one. AustinXBT is trained to channel the spirit (and tweets) of Austin Griffith, builder at the Ethereum Foundation and founder of BuidlGuidl, and deliver hands-on feedback on your project.

---

## Overview

- **Agent (`agent/`)**: LiveKit Voice Agent (either TTS or Realtime)
- **Client (`client/`)**: A Next.js web application that provides the user interface to interact with the agent via LiveKit.

## Getting Started

### Prerequisites

- Node.js and pnpm (for the client)
- Python and [uv](https://github.com/astral-sh/uv#installation) (for the agent)
- Access keys/credentials for any required services (e.g., LiveKit, STT/TTS providers, OpenAI, etc. - check `.env.example` files)

### Setup

1.  **Set up the Agent:**
    Set up the required environment variables in `.env`

    ```sh
    cd agent
    cp .env.example .env
    ```

    Install dependencies and download model files:

    ```sh
    make install
    make download-files
    ```

2.  **Set up the Client:**

    ```bash
    cd client
    cp .env.example .env.local
    ```

    Install dependencies:

    ```sh
    pnpm install
    ```

### Running the Project

1.  **Start the Agent:**

    ```sh
    cd agent
    make dev
    ```

2.  **Start the Client:**
    ```sh
    cd client
    pnpm dev
    ```

Open your browser to the address provided by the Next.js development server (usually `http://localhost:3000`).

---

# Voice Cloning with ElevenLabs

To create your own voice clone using ElevenLabs, follow their comprehensive guide:
https://elevenlabs.io/blog/how-to-clone-voice

---

# Contributing

Feel free to open [issues](https://github.com/devfolioco/austingpt/issues/new/choose) and [pull requests](https://github.com/devfolioco/austingpt/pulls)!

## Contributors

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
