import * as React from 'react'
import ReCaptchaComponent from './ReCaptchaComponent'

export type IProps = {
  captchaDomain: string
  onReceiveToken: (captchaToken: string) => void
  siteKey: string
  action: string
}

class ReCaptchaV3 extends React.PureComponent<IProps> {

  private _captchaRef: any

  public refreshToken = () => {
    this._captchaRef.refreshToken()
  }

  render() {
    return (
      <ReCaptchaComponent
        ref={ref => this._captchaRef = ref}
        action={this.props.action}
        captchaDomain={this.props.captchaDomain}
        siteKey={this.props.siteKey}
        onReceiveToken={(token: string) => {
          this.props.onReceiveToken(token)
        }}/>
    )
  }
}

export default ReCaptchaV3
