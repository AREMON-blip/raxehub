import { downloadResponse } from '../../../../src/download'
import { route } from '../../../../src/errors'

export const onRequest = route((ctx) => downloadResponse(ctx))
