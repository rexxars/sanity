import React, {Component} from 'react'
import SanityIcon from 'part:@sanity/base/sanity-logo-icon'
import WarningIcon from 'part:@sanity/base/warning-icon'
import VersionChecker from 'part:@sanity/base/version-checker'
import VersionInfoDialog from './VersionInfoDialog'
import styles from './styles/VersionInfo.css'

class VersionInfo extends Component {
  state = {}

  componentDidMount() {
    VersionChecker.checkVersions().then(this.handleVersionReply)
  }

  handleVersionReply = ({result}) => {
    const {isSupported, isUpToDate} = result
    const isCritical = true
    this.setState({isSupported, isUpToDate, isCritical})
  }

  handleShowVersionInfo = () => {
    this.setState({showVersionInfo: true})
  }

  handleHideVersionInfo = () => {
    this.setState({showVersionInfo: false})
  }

  render() {
    const {isSupported, isCritical, isUpToDate, showVersionInfo} = this.state
    const warn = !isSupported || isCritical
    let className = styles.button
    if (warn) {
      className = styles.critical
    } else if (!isUpToDate) {
      className = styles.warning
    }

    return (
      <div className={styles.container}>
        {showVersionInfo && <VersionInfoDialog onClose={this.handleHideVersionInfo} />}

        <button onClick={this.handleShowVersionInfo} className={className}>
          {warn ? <WarningIcon /> : <SanityIcon />}
          <span>v{VersionChecker.getLatestInstalled()}</span>
        </button>
      </div>
    )
  }
}

export default VersionInfo
