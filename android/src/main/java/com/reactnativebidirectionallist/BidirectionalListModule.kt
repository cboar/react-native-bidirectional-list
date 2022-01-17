package com.reactnativebidirectionallist

import android.util.Log
import android.view.View
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.*
import com.facebook.react.views.scroll.ReactScrollView
import com.facebook.react.views.view.ReactViewGroup
import java.util.HashMap
import java.lang.ref.WeakReference

class ScrollViewUIHolder(
  var autoscrollToTopThreshold: Int,
  var minIndexForVisible: Int
){
  var firstVisibleView: View? = null
  var prevFirstVisibleTop: Int = 0
  var currentScrollY: Int = 0
}

class BidirectionalListModule(val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  val uiHolders = HashMap<Int, ScrollViewUIHolder>()

  fun iterateScrollViews(
    uiManagerModule: UIManagerModule,
    callback: (uiHolder: ScrollViewUIHolder, scrollView: ReactScrollView) -> Unit
  ){
    uiHolders.entries.removeIf { (viewTag, uiHolder) ->
      try {
        val scrollView = uiManagerModule.resolveView(viewTag) as ReactScrollView
        callback.invoke(uiHolder, scrollView)
        false /* do not remove item */
      } catch(e: IllegalViewOperationException) {
        true /* could not find view, remove this item */
      }
    }
  }

  fun preWillDispatchViewUpdates(uiManagerModule: UIManagerModule){
    iterateScrollViews(uiManagerModule, fun(uiHolder, scrollView) {

      val content = scrollView.getChildAt(0) as ReactViewGroup? ?: return
      uiHolder.currentScrollY = scrollView.scrollY
      for (ii in uiHolder.minIndexForVisible..content.childCount) {
        val subview = content.getChildAt(ii)
        if (subview.top >= uiHolder.currentScrollY) {
          uiHolder.prevFirstVisibleTop = subview.top
          uiHolder.firstVisibleView = subview
          break
        }
      }

    })
  }

  fun onLayoutUpdated(uiManagerModule: UIManagerModule){
    iterateScrollViews(uiManagerModule, fun(uiHolder, scrollView) {

      val view = uiHolder.firstVisibleView ?: return
      val deltaY = view.top - uiHolder.prevFirstVisibleTop
      if(Math.abs(deltaY) > 1){
        val isWithinThreshold = uiHolder.currentScrollY <= uiHolder.autoscrollToTopThreshold
        scrollView.setScrollY(uiHolder.currentScrollY + deltaY)
        // If the offset WAS within the threshold of the start, animate to the start.
        if(isWithinThreshold){
          scrollView.smoothScrollTo(scrollView.scrollX, 0)
        }
      }

    })
  }

  override fun initialize(){
    super.initialize()

    val uiManagerModule = reactContext.getNativeModule(UIManagerModule::class.java)
    val uiManagerModuleListener = object : UIManagerModuleListener {
      override fun willDispatchViewUpdates(uiManagerModule: UIManagerModule) {
        uiManagerModule.prependUIBlock(object : UIBlock {
          override fun execute(nativeViewHierarchyManager: NativeViewHierarchyManager) {
            preWillDispatchViewUpdates(uiManagerModule)
          }
        })
      }
    }

    val layoutUpdateListener = object : UIImplementation.LayoutUpdateListener {
      override fun onLayoutUpdated(root: ReactShadowNode<*>) {
        onLayoutUpdated(uiManagerModule)
      }
    }

    uiManagerModule.getUIImplementation().setLayoutUpdateListener(layoutUpdateListener)
    uiManagerModule.addUIManagerListener(uiManagerModuleListener)
  }

  @ReactMethod
  fun enableMVCP(viewTag: Int, autoscrollToTopThreshold: Int, minIndexForVisible: Int) {
    uiHolders.get(viewTag)?.let {
      it.autoscrollToTopThreshold = autoscrollToTopThreshold
      it.minIndexForVisible = minIndexForVisible
    } ?: run {
      uiHolders.put(viewTag, ScrollViewUIHolder(autoscrollToTopThreshold, minIndexForVisible))
    }
  }

  @ReactMethod
  fun disableMVCP(viewTag: Int) {
    uiHolders.remove(viewTag)
  }

  override fun getName(): String {
    return "BidirectionalList"
  }

}