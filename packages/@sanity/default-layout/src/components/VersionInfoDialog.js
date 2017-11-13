import React, {Component} from 'react'
import PropTypes from 'prop-types'
import userStore from 'part:@sanity/base/user'
import Dialog from 'part:@sanity/components/dialogs/default'
import VersionChecker from 'part:@sanity/base/version-checker'
import LoadingSpinner from 'part:@sanity/components/loading/spinner'
import styles from './styles/VersionInfo.css'

class VersionInfoDialog extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired
  }

  state = {}

  componentWillMount() {
    VersionChecker.checkVersions({getOutdated: true})
      .then(this.handleVersionReply)
      .catch(this.handleError)

    this.userSubscription = userStore.currentUser.subscribe(event => {
      this.setState({user: event.user})
    })
  }

  componentWillUnmount() {
    this.userSubscription.unsubscribe()
  }

  handleError = error => {
    this.setState({error})
  }

  handleVersionReply = ({result}) => {
    this.setState(result)
  }

  renderTable() {
    const {outdated, user} = this.state
    return (
      <div>
        <table className={styles.versionsTable}>
          <thead>
            <tr>
              <th>Module</th>
              <th>Installed</th>
              <th>Latest</th>
            </tr>
          </thead>
          <tbody>
            {outdated.map(pkg => (
              <tr key={pkg.name}>
                <td>{pkg.name}</td>
                <td>v0.118.0</td>
                <td>{pkg.latest}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {user.role === 'administrator' && (
          <p>
            To upgrade, run <code className={styles.code}>sanity upgrade</code> in your studio.
          </p>
        )}
      </div>
    )
  }

  render() {
    const {outdated, user, error} = this.state
    const isLoading = !outdated || !user

    return (
      <Dialog
        isOpen
        showHeader
        onAction={this.props.onClose}
        actions={[{index: 1, title: 'OK'}]}
        onClose={this.props.onClose}
        title="New versions available"
      >
        {error && <p>An error occured while loading module info.</p>}
        {!error && isLoading && <LoadingSpinner message="Loading module info..." />}
        {!error && !isLoading && this.renderTable()}
      </Dialog>
    )
  }
}

export default VersionInfoDialog
