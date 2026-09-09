import { getAcquisitionContext } from './acquisition';

export const bookingService = { prepare: () => ({ acquisition: getAcquisitionContext() }) };
