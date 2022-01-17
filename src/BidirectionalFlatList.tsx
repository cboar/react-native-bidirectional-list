import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';
import { withMVCP } from './withMVCP';

const FlatListMVCP = withMVCP(FlatList, (fl) => fl?.getScrollableNode());
const [IDLE, FETCHING, QUEUED] = [0, 1, 2];

class BidirectionalFlatList extends PureComponent {
  statusTop = IDLE;
  statusBottom = IDLE;
  offset = 0;
  viewHeight = 0;
  contentHeight = 0;
  scrolling = false;
  heightChanged = false;
  queuedUpdate = false;

  constructor(props) {
    super(props);
    const { reachedTop, loaderHeight } = props;
    this.initialOffset = {
      x: 0,
      y: reachedTop ? 0 : loaderHeight,
    };
    this._memoData();
  }

  _memoData() {
    const { memo, scrolling, queuedUpdate } = this;
    if (memo === this.props.data) return;

    if (memo && scrolling) {
      this.queuedUpdate = true;
    } else if (!queuedUpdate) {
      this.memo = this.props.data;
    }
  }

  _allowDataUpdate = () => {
    if (this.queuedUpdate) {
      this.queuedUpdate = false;
      this.forceUpdate();
    }
  };

  _onStartReached() {
    if (!this.props.onStartReached) return;
    const { statusTop, statusBottom } = this;
    if (statusBottom === FETCHING) {
      this.statusTop = QUEUED;
    } else if (statusTop === IDLE) {
      this.statusTop = FETCHING;
      this.props.onStartReached();
    }
  }

  _onEndReached() {
    if (!this.props.onEndReached) return;
    const { statusTop, statusBottom } = this;
    if (statusTop === FETCHING) {
      this.statusBottom = QUEUED;
    } else if (statusBottom === IDLE) {
      this.statusBottom = FETCHING;
      this.props.onEndReached();
    }
  }

  _maybeBeginLoading = () => {
    const { offset, contentHeight, viewHeight } = this;
    const { reachedTop, reachedBottom, loaderHeight } = this.props;
    const nearTop = offset < loaderHeight;
    const nearBottom = contentHeight - viewHeight - offset < loaderHeight;

    if (nearTop && !reachedTop) this._onStartReached();
    if (nearBottom && !reachedBottom) this._onEndReached();
  };

  _debouncedUnlock = () => {
    clearTimeout(this.debounced);
    this.debounced = setTimeout(() => {
      this.scrolling = false;
      this._allowDataUpdate();

      if (!this.heightChanged) return;
      const { statusTop, statusBottom } = this;
      this.heightChanged = false;
      this.statusTop = IDLE;
      this.statusBottom = IDLE;

      this._maybeBeginLoading();
      if (statusTop === QUEUED) this._onStartReached();
      if (statusBottom === QUEUED) this._onEndReached();
    }, 100);
  };

  _onLayout = (evt) => {
    if (this.props.onLayout) this.props.onLayout(evt);
    this.viewHeight = evt.nativeEvent.layout.height;
  };

  _onContentSizeChange = (width, height) => {
    if (this.props.onContentSizeChange)
      this.props.onContentSizeChange(width, height);
    if (this.contentHeight && this.contentHeight !== height) {
      this.heightChanged = true;
    }
    this.contentHeight = height;
    this._debouncedUnlock();
  };

  _onMomentumScrollEnd = () => {
    if (this.props.onMomentumScrollEnd) this.props.onMomentumScrollEnd();
    this.scrolling = false;
    this._allowDataUpdate();
    this._debouncedUnlock();
  };

  _onScroll = (evt) => {
    if (this.props.onScroll) this.props.onScroll(evt);
    this.offset = evt.nativeEvent.contentOffset.y;
    this.scrolling = true;
    this._debouncedUnlock();
    this._maybeBeginLoading();
  };

  render() {
    this._memoData();
    const {
      forwardRef,
      reachedTop,
      reachedBottom,
      minIndexForVisible,
      LoadingComponent,
    } = this.props;
    const { memo: data, initialOffset, queuedUpdate } = this;

    return (
      <FlatListMVCP
        ref={forwardRef}
        scrollEventThrottle={8}
        contentOffset={initialOffset}
        {...this.props}
        data={data}
        ListHeaderComponent={
          reachedTop && !queuedUpdate ? View : LoadingComponent
        }
        ListFooterComponent={
          reachedBottom && !queuedUpdate ? View : LoadingComponent
        }
        onScroll={this._onScroll}
        onLayout={this._onLayout}
        onMomentumScrollEnd={this._onMomentumScrollEnd}
        onContentSizeChange={this._onContentSizeChange}
        onEndReached={null}
        maintainVisibleContentPosition={{ minIndexForVisible }}
      />
    );
  }
}

BidirectionalFlatList.defaultProps = {
  loaderHeight: 100,
  minIndexForVisible: 1,
  LoadingComponent: View,
};

export default React.forwardRef((props, ref) => {
  return <BidirectionalFlatList {...props} forwardRef={ref} />;
});
