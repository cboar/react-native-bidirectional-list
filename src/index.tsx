import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-bidirectional-list' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const BidirectionalList = NativeModules.BidirectionalList
  ? NativeModules.BidirectionalList
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function enableMVCP(
  viewTag: number,
  autoscrollToTopThreshold: number,
  minIndexForVisible: number
) {
  return BidirectionalList.enableMVCP(
    viewTag,
    autoscrollToTopThreshold,
    minIndexForVisible
  );
}
