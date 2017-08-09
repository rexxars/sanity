import PropTypes from 'prop-types'
import React from 'react'
import styles from 'part:@sanity/components/edititem/popover-style'
import Button from 'part:@sanity/components/buttons/default'
import CloseIcon from 'part:@sanity/base/close-icon'
import StickyPortal from 'part:@sanity/components/portal/sticky'


export default class EditItemPopOver extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
      kind: PropTypes.string,
      title: PropTypes.string,
      handleClick: PropTypes.func
    })),
    fullWidth: PropTypes.bool,
    isOpen: PropTypes.bool
  };

  static defaultProps = {
    onClose() {}, // eslint-disable-line
    actions: [],
    isOpen: true
  };

  state = {
    arrowLeft: 0
  }

  handleBackdropClick = event => {
    this.handleClose()
    event.stopPropagation()
    event.preventDefault()
  }

  setArrowElement = element => {
    this._arrowElement = element
  }

  setContentElement = element => {
    this._contentElement = element
  }

  handleContentScroll = event => {
    this._contentScrollTop = event.target.scrollTop
  }

  handleStickyResize = ({rootLeft, containerWidth}) => {
    this.setState({
      arrowLeft: rootLeft,
      offsetLeft: (window.innerWidth - containerWidth) / 2
    })
  }

  render() {
    const {title, children, className, actions, fullWidth} = this.props
    const {arrowLeft, offsetLeft} = this.state
    const modalContainerClassName = `${fullWidth ? styles.fullWidth : styles.autoWidth} ${className || ''}`
    console.log(arrowLeft)
    return (
      <StickyPortal isOpen onClose={this.handleClose} onResize={this.handleStickyResize}>
        <div className={modalContainerClassName}>

          <div className={styles.overlay} onClick={this.handleBackdropClick} />

          <div
            className={styles.modal}
            style={{transform: `translateX(${offsetLeft}px)`}}
          >

            <div className={styles.arrow} style={{transform: `translateX(${arrowLeft}px)`}} />

            <button className={styles.close} type="button" onClick={this.handleClose}>
              <CloseIcon />
            </button>

            <div className={styles.head}>
              <h3 className={styles.title}>
                {title}
              </h3>
            </div>

            <div ref={this.setContentElement}>
              {children}
            </div>
            {
              actions.length > 0 && <div className={styles.functions}>
                {
                  actions.map((action, i) => {
                    return (
                      <Button
                        key={i}
                        onClick={action.handleClick}
                        data-action-index={i}
                        kind={action.kind}
                        className={styles[`button_${action.kind}`] || styles.button}
                      >
                        {action.title}
                      </Button>
                    )
                  })
                }
              </div>
            }
          </div>
        </div>
      </StickyPortal>
    )
  }
}
