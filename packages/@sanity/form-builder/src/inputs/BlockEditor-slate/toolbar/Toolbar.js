import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Toolbar.css'
import InsertBlocks, {insertBlockShape} from './InsertBlocks'
import Decorators, {decorator} from './Decorators'
import ListItems, {listItem} from './ListItems'
import BlockStyle, {blockStyleShape} from './BlockStyle'
import Button from 'part:@sanity/components/buttons/default'
import FullscreenIcon from 'part:@sanity/base/fullscreen-icon'
import CloseIcon from 'part:@sanity/base/close-icon'
import LinkButton from './LinkButton'

export default class Toolbar extends React.Component {

  static propTypes = {
    onInsertBlock: PropTypes.func,
    onFullscreenEnable: PropTypes.func,
    className: PropTypes.string,
    fullscreen: PropTypes.bool,
    onMarkButtonClick: PropTypes.func,
    onListButtonClick: PropTypes.func,
    onBlockStyleChange: PropTypes.func,
    insertBlocks: PropTypes.arrayOf(insertBlockShape),
    decorators: PropTypes.arrayOf(
      decorator
    ),
    listItems: PropTypes.arrayOf(
      listItem
    ),
    blockStyles: PropTypes.shape({
      value: PropTypes.arrayOf(blockStyleShape),
      items: PropTypes.arrayOf(blockStyleShape),
      onSelect: PropTypes.func
    }),
    onLinkButtonClick: PropTypes.func,
    activeLinks: PropTypes.arrayOf(PropTypes.object),
    showLinkButton: PropTypes.bool
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.decorators !== nextProps.decorators
      || this.props.blockStyles !== nextProps.blockStyles
      || this.props.fullscreen !== nextProps.fullscreen
      || this.props.activeLinks !== nextProps.activeLinks
    )
  }

  render() {
    const {
      className,
      fullscreen,
      decorators,
      onInsertBlock,
      onMarkButtonClick,
      onListButtonClick,
      onBlockStyleChange,
      listItems,
      blockStyles,
      insertBlocks,
      onLinkButtonClick,
      activeLinks,
      showLinkButton
    } = this.props

    return (
      <div className={`${styles.root} ${className}`}>
        <div className={styles.blockFormatContainer}>
          <BlockStyle value={blockStyles.value} items={blockStyles.items} onSelect={onBlockStyleChange} />
        </div>

        <div className={styles.formatButtons}>
          {decorators && decorators.length > 0 && (
            <div className={styles.textFormatContainer}>
              <Decorators decorators={decorators} onClick={onMarkButtonClick} />
            </div>
          )}

          {listItems && listItems.length > 0 && (
            <div className={styles.listFormatContainer}>
              <ListItems listItems={listItems} onClick={onListButtonClick} />
            </div>
          )}
        </div>

        {
          showLinkButton && (
            <div className={styles.linkContainer}>
              <LinkButton activeLinks={activeLinks} onClick={onLinkButtonClick} />
            </div>
          )
        }

        <div className={styles.fullscreenButtonContainer}>
          <Button
            kind="simple"
            onClick={this.props.onFullscreenEnable}
            icon={fullscreen ? CloseIcon : FullscreenIcon}
          />
        </div>

        {insertBlocks.length > 0 && (
          <div className={styles.insertContainer}>
            <InsertBlocks blocks={insertBlocks} onInsertBlock={onInsertBlock} />
          </div>
        )}
      </div>
    )
  }
}
