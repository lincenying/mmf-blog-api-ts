import supertest from 'supertest'

import { createApp } from '../../src/app'

export type TestAgent = supertest.Agent

let agent: TestAgent | null = null

export function getTestAgent(): TestAgent {
    if (!agent) {
        agent = supertest.agent(createApp())
    }
    return agent
}

export function resetTestAgent() {
    agent = null
}
