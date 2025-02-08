# LiveKit + Next.js AI Voice Agent Interface

A basic example of a Next.js frontend for a LiveKit AI voice agent.

## Dev Setup

Clone the repository and install dependencies:

```console
cd livekit-nextjs-voice-agent-interface
yarn install
```

Set up the environment by copying `.env.example` to `.env.local` and filling in the required values:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

Run the agent:

```console
yarn dev
```

This frontend application requires an agent to communicate with. You can use one this example agent in [livekit-voice-agent-python](https://github.com/kylecampbell/livekit-voice-agent-python)
