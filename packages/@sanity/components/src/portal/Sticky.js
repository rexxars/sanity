import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Sticky.css'
import Portal from 'react-portal'
import ease from 'ease-component'
import getComputedTranslateY from './utils/getComputedTranslateY'
import elementResizeDetectorMaker from 'element-resize-detector'
import scroll from 'scroll'

const scrollOptions = {
  duration: 250,
  ease: ease.easeInOutQuart
}

const stickToTop = false

export default class StickyPortal extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool,
    className: PropTypes.string,
    ignoreScroll: PropTypes.bool,
    onClose: PropTypes.func,
    onResize: PropTypes.func
  }

  static defaultProps = {
    scrollContainer: null,
    className: '',
    isOpen: false,
    ignoreScroll: false,
    onClose: () => {},
    onResize: () => {}
  }

  state = {
    portalIsOpen: false,
    isFocused: true,
    availableSpaceStyle: {
      top: 0,
      left: 0
    }
  }

  _elementResizeDetector = elementResizeDetectorMaker({strategy: 'scroll'})
  _containerScrollTop = 0

  // Root positions
  _rootTop = 0
  _rootLeft = 0

  // ScrollContainer positions
  _scrollContainerLeft = 0
  _scrollContainerWidth = 0

  componentDidMount() {

    this.tryFindScrollContainer()
    this.handleWindowResize()
    this.moveIntoPosition()

    // Save the initial scrolltop
    if (this._scrollContainerElement) {
      this._initialScrollTop = this._scrollContainerElement.scrollTop
    }

    // Don't allow any user scrolling of the page when modals are shown
    // this._initialBodyStyleOverflow = document.body.style.overflow

    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('resize', this.handleWindowResize)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('resize', this.handleWindowResize)
    if (this._scrollContainerElement) {
      this._scrollContainerElement.removeEventListener('scroll', this.handleContainerScroll, {passive: true})
    }
    this._elementResizeDetector.uninstall(this._contentElement.firstChild)
  }

  handleContainerScroll = () => {
    this._containerScrollTop = this._scrollContainerElement.scrollTop
    this.moveIntoPosition()
  }

  tryFindScrollContainer() {
    let scrollContainer = this._rootElement.parentNode
    console.log('tryFindScrollContainer')
    while (!this._scrollContainerElement) {
      if (!scrollContainer.parentNode) {
        break
      }
      if (['overlay', 'auto', 'scroll'].includes(window.getComputedStyle(scrollContainer).overflowY)) {
        this._scrollContainerElement = scrollContainer
        this.setScollContainerRects()

        if (!this.props.ignoreScroll && this._scrollContainerElement) {
          this._scrollContainerElement.addEventListener('scroll', this.handleContainerScroll, {passive: true})
        }
        break
      }
      scrollContainer = scrollContainer.parentNode

      if (__DEV__) {
        console.info('scrollContainer', this._scrollContainerElement) // eslint-disable-line
      }
    }
    if (!scrollContainer) {
      throw new Error('StickyPortal needs a scrollcontainer')
    }
  }

  setContentScrollTop = event => {
    this._contentElement.scrollTop = this._contentScrollTop
  }

  addMovingListeners = () => {
    this._contentElement.addEventListener('scroll', this.handleContentScroll)
    // this._contentElement.addEventListener('focusin', this.setContentScrollTop)
    this._elementResizeDetector.listenTo(
      this._contentElement.firstChild,
      this.handleElementResize
    )
  }

  removeMovingListeners = () => {
    this._contentElement.removeEventListener('focusin', this.setContentScrollTop)
    // this._contentElement.removeEventListener('scroll', this.handleContentScroll)
    this._elementResizeDetector.removeListener(
      this._contentElement.firstChild,
      this.handleElementResize
    )
  }

  handleContentScroll = event => {
    console.log('handleContentScroll')
    this._contentScrollTop = event.target.scrollTop
  }

  handleClose() {
    this.props.onClose()
  }

  handleKeyDown = event => {
    if (event.key == 'Escape') {
      this.handleClose()
    }
  }

  handleBackdropClick = event => {
    this.handleClose()
    event.stopPropagation()
    event.preventDefault()
  }

  // TODO: the modal could possible be in an unmounted state here,
  // though propably not an issue. But should be fixed.
  handleWindowResize = () => {
    clearTimeout(this._resizeTimeout)
    this.moveIntoPosition()
    this._resizeTimeout = setTimeout(() => {
      this.handleWindowResizeDone()
    }, 70)
  }

  handleWindowResizeDone() {
    // this.moveIntoPosition()
  }

  setRootRects() {
    const {top, left} = this._rootElement.getBoundingClientRect()
    this._rootTop = top
    this._rootLeft = left
  }

  setScollContainerRects() {
    const {width, left} = this._scrollContainerElement.getBoundingClientRect()
    this._scrollContainerLeft = left
    this._scrollContainerWidth = width
  }


  stickToRoot() {
    this.setRootRects()
    // const currentModalTranslateY = getComputedTranslateY(this._availableSpaceElement)

    if (this._rootTop < 0 && stickToTop) {
      this._availableSpaceElement.style.top = '0'
    } else {

      this._availableSpaceElement.style.top = `${this._rootTop}px`
    }

    this._availableSpaceElement.style.left = '0'
    this.resizeAvailableSpace()
  }

  resizeAvailableSpace() {
    if (this._rootTop < 0 && stickToTop) {
      this._availableSpaceElement.style.height = `${window.innerHeight}px`
    } else {
      this._availableSpaceElement.style.height = `${window.innerHeight - this._rootTop}px`
    }
    //this._availableSpaceElement.style.width = `${window.innerWidth}px`
    //this._availableSpaceElement.style.width = `${window.innerWidth - this._rootLeft}px`
  }


  moveIntoPosition(shouldMoveOtherModals) {
    console.log('move')
    // Remove listeners, as we don't want anything the be triggered while
    // we are manipulating the modal
    this.removeMovingListeners()

    this.stickToRoot()

    this.props.onResize({
      rootLeft: this._rootLeft,
      containerWidth: this._scrollContainerWidth,
      containerLeft: this._scrollContainerLeft
    })


    //
    // const modalRects = this._availableSpaceElement.getBoundingClientRect()
    //
    // const windowWidth = window.innerWidth
    //
    // const scrollContainer = this._scrollContainerElement
    // const scrollTop = scrollContainer.scrollTop
    //
    // let modalTranslateY = 0
    // let newScrollTop
    //
    // const padding = 80

    // Make sure the whole width is visible within the screen,
    // and move arrow to point to originating element
    // if ((modalRects.width + left + padding) > windowWidth) {
    //   const diff = windowWidth - modalRects.width - padding - left
    //   this._availableSpaceElement.style.marginLeft = `${diff}px`
    //   this._arrowElement.style.transform = `translateX(${diff * -1}px)`
    // }

    // const availableSpaceBottom = () => this._availableSpaceElement.offsetTop + this._availableSpaceElement.offsetHeight
    //
    // let scrollContainerRects = scrollContainer.getBoundingClientRect()
    //
    // const doesNotFitWithinScreen = availableSpaceBottom() + padding > scrollContainerRects.bottom

    // If there isn't vertical room in the scrollcontainer to show the dialog,
    // add extra padding and scroll it into view
    if (false && doesNotFitWithinScreen) {

      if (__DEV__) {
        console.log('doesNotFitWithinScreen') // eslint-disable-line
      }

      // Add padding

      // First check if we need to pad down to the bottom of the scroll container
      // (content is not filling up the scroll container as we add padding from the bottom)
      // let padChildToBottom = scrollContainerRects.bottom - this._paddingDummy.getBoundingClientRect().bottom
      // if (padChildToBottom < 0) {
      //   padChildToBottom = 0
      // }

      // Add needed padding to show the whole modal
      // const extraPaddingBottom = padChildToBottom
      //   + parseInt(this._paddingDummy.style.paddingBottom || 0, 10)
      //   + (availableSpaceBottom() - scrollContainerRects.bottom)
      //   + padding
      // if (extraPaddingBottom > 0) {
      //   this._paddingDummy.style.paddingBottom = `${extraPaddingBottom}px`
      // }

      // Compute new rect after padding is applied
      // scrollContainerRects = scrollContainer.getBoundingClientRect()

      // const contextVisibilityHeight = 50

      // Model content is too large to display on screen
      // if (modalRects.height >= (scrollContainerRects.height - contextVisibilityHeight - padding)) {
      //   // Set this modal to max possible height
      //   const newHeight = scrollContainer.offsetHeight - padding - contextVisibilityHeight
      //
      //   this._availableSpaceElement.style.height = `${newHeight}px`
      //
      //   if (this._contentElement.className !== styles.contentWithScroll) { // eslint-disable-line max-depth
      //     this._contentElement.className = styles.contentWithScroll
      //   }
      //   // Set back scroll position of modal content if something is resizing
      //   // it and triggering this.handleElementResize
      //   this._contentElement.scrollTop = this._contentScrollTop
      // } else {
      //   this._contentElement.className = styles.content
      // }

      // The new scollposition of the scollcontainer
      // newScrollTop = scrollContainer.scrollTop
      //   + (availableSpaceBottom() - scrollContainerRects.bottom)
      //   + padding

      // If we already have translated, add that to the new scrolltop
      // newScrollTop += currentModalTranslateY

      // Set the new translate
      // modalTranslateY = scrollTop - newScrollTop + currentModalTranslateY
      // this._availableSpaceElement.style.transform = `translateY(${modalTranslateY}px)`

      // Do the scroll
      // scroll.top(scrollContainer, newScrollTop, scrollOptions, this.addMovingListeners)

    } else {  // Model content fits within the current screen
      // this._contentElement.className = styles.content
      // Set the new translate
      // modalTranslateY = scrollTop - this._initialScrollTop + currentModalTranslateY
      // this._availableSpaceElement.style.transform = `translateY(${modalTranslateY}px)`
      // Do the scroll
      // scroll.top(scrollContainer, this._initialScrollTop, scrollOptions, this.addMovingListeners)
    }

    // Move other modals accordingly (on open)
    // if (shouldMoveOtherModals) {
    //   popOverStack.slice(0, -1).forEach(popOver => {
    //     const translateY = getComputedTranslateY(popOver._availableSpaceElement)
    //     popOver._translateYHistory.push(translateY)
    //     const newTranslateY = translateY + modalTranslateY
    //     popOver._availableSpaceElement.style.transform = `translateY(${newTranslateY}px)`
    //   })
    // }
  }

  handleElementResize = el => {
    const scrollHeight = el.scrollHeight
    if (scrollHeight !== this._contentElementScrollHeight) {
      this._contentElementScrollHeight = scrollHeight
      if (this.state.isFocused) {
        this.moveIntoPosition()
      }
    }
  }

  // Set elements
  setAvailableSpaceElement = element => {
    this._availableSpaceElement = element
  }
  setContentElement = element => {
    this._contentElement = element

  }
  setRootElement = element => {
    this._rootElement = element
    const {isOpen} = this.props
    this.setState({portalIsOpen: isOpen})
  }

  renderPortal = () => {
    const {className, children} = this.props
    const availableSpaceClass = `${__DEV__ ? styles.availableSpaceDebug : styles.availableSpace} ${className}`
    return (
      <Portal isOpened closeOnEsc={false} onOpen={this.handlePortalOpened}>

        <div className={availableSpaceClass} ref={this.setAvailableSpaceElement} style={this.state.availableSpaceStyle}>
          <div ref={this.setContentElement} className={styles.content}>
            {children}
          </div>
        </div>

      </Portal>
    )
  }

  render() {
    return (
      <span ref={this.setRootElement} className={styles.root}>
        { this.renderPortal() }
      </span>
    )
  }
}
