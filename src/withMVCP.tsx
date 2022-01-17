import React, { useEffect, useRef } from 'react';
import { NativeModules } from 'react-native';

const BidirectionalList = NativeModules.BidirectionalList;

function enableMVCP(
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

function disableMVCP(viewTag: number) {
  return BidirectionalList.disableMVCP(viewTag);
}

export function withMVCP(Component, scrollViewTagExtractor) {
  return React.forwardRef((props, forwardRef) => {
    const { maintainVisibleContentPosition: mvcp } = props;
    const { autoscrollToTopThreshold, minIndexForVisible } = mvcp ?? {};
    const refViewTag = useRef();

    const refCallback = (ref) => {
      refViewTag.current = scrollViewTagExtractor(ref);
      if (typeof forwardRef === 'function') {
        forwardRef(ref);
      } else if (forwardRef) {
        forwardRef.current = ref;
      }
    };

    useEffect(() => {
      return () => {
        const viewTag = refViewTag.current;
        if (viewTag) disableMVCP(viewTag);
      };
    }, []);

    useEffect(() => {
      const viewTag = refViewTag.current;
      if (!viewTag) return;
      if (
        autoscrollToTopThreshold !== undefined ||
        minIndexForVisible !== undefined
      ) {
        enableMVCP(
          viewTag,
          autoscrollToTopThreshold ?? -Number.MAX_SAFE_INTEGER,
          minIndexForVisible ?? 0
        );
      } else {
        disableMVCP(viewTag);
      }
    }, [autoscrollToTopThreshold, minIndexForVisible]);

    return (
      <Component
        ref={refCallback}
        {...props}
        maintainVisibleContentPosition={undefined}
      />
    );
  });
}
