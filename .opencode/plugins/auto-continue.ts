/**
 * Auto-Continue Plugin for OpenCode
 *
 * Automatically sends "continue" when the agent becomes idle.
 *
 * Configuration:
 * - MAX_CONTINUES: Maximum number of auto-continues per session (0 = unlimited)
 * - CONTINUE_MESSAGE: The message to send when continuing
 * - COOLDOWN_MS: Minimum time between continues to prevent rapid loops
 */

import type { Plugin } from "@opencode-ai/plugin"

const MAX_CONTINUES = -1 
const CONTINUE_MESSAGE = "continue"
const COOLDOWN_MS = 1000

interface SessionState {
  continueCount: number
  lastContinueTimestamp: number
}

const sessionStateMap = new Map<string, SessionState>()

function getOrCreateSessionState(sessionID: string): SessionState {
  let state = sessionStateMap.get(sessionID)
  if (!state) {
    state = { continueCount: 0, lastContinueTimestamp: 0 }
    sessionStateMap.set(sessionID, state)
  }
  return state
}

function isCooldownActive(state: SessionState): boolean {
  return Date.now() - state.lastContinueTimestamp < COOLDOWN_MS
}

function hasReachedMaxContinues(state: SessionState): boolean {
  return MAX_CONTINUES > 0 && state.continueCount >= MAX_CONTINUES
}

export const AutoContinuePlugin: Plugin = async ({ client }) => {
  await client.app.log({
    body: {
      service: "auto-continue",
      level: "info",
      message: `Plugin initialized (max: ${MAX_CONTINUES === 0 ? "unlimited" : MAX_CONTINUES})`,
    },
  })

  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return

      const sessionID = event.properties.sessionID
      const state = getOrCreateSessionState(sessionID)

      if (isCooldownActive(state)) {
        return
      }

      if (hasReachedMaxContinues(state)) {
        await client.app.log({
          body: {
            service: "auto-continue",
            level: "info",
            message: `Session ${sessionID} reached max continues (${MAX_CONTINUES})`,
          },
        })
        return
      }

      state.continueCount++
      state.lastContinueTimestamp = Date.now()

      await client.app.log({
        body: {
          service: "auto-continue",
          level: "info",
          message: `Continuing session ${sessionID} (${state.continueCount}${MAX_CONTINUES > 0 ? `/${MAX_CONTINUES}` : ""})`,
        },
      })

      try {
        await client.session.promptAsync({
          path: { id: sessionID },
          body: {
            parts: [{ type: "text", text: CONTINUE_MESSAGE }],
          },
        })
      } catch (error) {
        await client.app.log({
          body: {
            service: "auto-continue",
            level: "error",
            message: `Failed to send continue: ${error}`,
          },
        })
      }
    },
  }
}
