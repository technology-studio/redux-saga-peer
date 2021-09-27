/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2021-08-18T19:08:50+02:00
 * @Copyright: Technology Studio
**/

import {
  call,
  fork,
  take,
  cancel,
  ForkEffect,
  SagaReturnType,
} from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import type { Task } from '@redux-saga/types'
import type {
  ContextServiceAction,
  DefaultRootService,
} from '@txo/service-react'
import { configManager } from '@txo-peer-dep/redux-saga'
import { Log } from '@txo/log'

const log = new Log('txo.redux-saga.Api.SagaEffectHelper')

const DEFAULT_CONTEXT = 'default'

type ContextFn<ARGS> = (
  service: DefaultRootService,
  action: ContextServiceAction,
  ...args: ARGS[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any

export const takeLatestByContext = <ARGS, FN extends ContextFn<ARGS>>(
  patternOrChannel: string,
  saga: FN,
  service: DefaultRootService,
): ForkEffect<never> => fork(function * () {
    const lastTaskContextMap: Record<string, Task> = {}
    while (true) {
      const action: ContextServiceAction = yield take(patternOrChannel)
      const context = action.context ?? DEFAULT_CONTEXT
      const lastTask = lastTaskContextMap[context]
      if (lastTask) {
        yield cancel(lastTask) // cancel is no-op if the task has already terminated
        log.debug(`cancelled: ${context}`)
      }
      lastTaskContextMap[context] = yield fork<ContextFn<ARGS>>(saga, service, action)
    }
  })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorSafeFork = <Fn extends (...args: any[]) => any>(
  fn: Fn,
  ...args: Parameters<Fn>
): ForkEffect<SagaReturnType<Fn>> | undefined => {
  function * errorSafeSaga (...args: Parameters<Fn>): SagaIterator<void> {
    try {
      return yield call(fn, ...args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      configManager.config.onError(error)
    }
  }
  return fork(errorSafeSaga, ...args)
}
