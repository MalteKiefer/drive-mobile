import { UserReferral, ReferralKey } from '@internxt/sdk/dist/drive/referrals/types';
import { Referrals } from '@internxt/sdk/dist/drive';
import appService from './app';

class UsersReferralsService {
  private client?: Referrals;

  public initialize(accessToken: string, mnemonic: string) {
    this.client = Referrals.client(
      `${process.env.REACT_NATIVE_DRIVE_API_URL}/api/users-referrals`,
      {
        clientName: appService.name,
        clientVersion: appService.version,
      },
      {
        token: accessToken,
        mnemonic,
      },
    );
  }

  public async fetch(): Promise<UserReferral[]> {
    return this.client?.getReferrals() || [];
  }

  public hasClickAction(referralKey: ReferralKey): boolean {
    return [ReferralKey.SubscribeToNewsletter, ReferralKey.InstallDesktopApp, ReferralKey.InviteFriends].includes(
      referralKey,
    );
  }
}

const usersReferralsService = new UsersReferralsService();
export default usersReferralsService;
