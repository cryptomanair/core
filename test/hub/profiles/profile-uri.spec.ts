import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { FollowNFT__factory } from '../../../typechain-types';
import { MAX_UINT256, ZERO_ADDRESS } from '../../helpers/constants';
import { ERRORS } from '../../helpers/errors';
import {
  cancelWithPermitForAll,
  getJsonMetadataFromBase64TokenUri,
  getSetFollowNFTURIWithSigParts,
  getSetProfileImageURIWithSigParts,
} from '../../helpers/utils';
import {
  FIRST_PROFILE_ID,
  lensHub,
  makeSuiteCleanRoom,
  MOCK_FOLLOW_NFT_URI,
  MOCK_PROFILE_HANDLE,
  MOCK_PROFILE_URI,
  MOCK_URI,
  OTHER_MOCK_URI,
  testWallet,
  user,
  userAddress,
  userTwo,
  userTwoAddress,
} from '../../__setup.spec';

makeSuiteCleanRoom('Profile URI Functionality', function () {
  context('Generic', function () {
    beforeEach(async function () {
      await expect(
        lensHub.createProfile({
          to: userAddress,
          handle: MOCK_PROFILE_HANDLE,
          imageURI: MOCK_PROFILE_URI,
          followModule: ZERO_ADDRESS,
          followModuleData: [],
          followNFTURI: MOCK_FOLLOW_NFT_URI,
        })
      ).to.not.be.reverted;
    });

    context('Negatives', function () {
      it('UserTwo should fail to set the profile URI on profile owned by user 1', async function () {
        await expect(
          lensHub.connect(userTwo).setProfileImageURI(FIRST_PROFILE_ID, MOCK_URI)
        ).to.be.revertedWith(ERRORS.NOT_PROFILE_OWNER_OR_DISPATCHER);
      });

      it('UserTwo should fail to change the follow NFT URI for profile one', async function () {
        await expect(
          lensHub.connect(userTwo).setFollowNFTURI(FIRST_PROFILE_ID, OTHER_MOCK_URI)
        ).to.be.revertedWith(ERRORS.NOT_PROFILE_OWNER_OR_DISPATCHER);
      });
    });

    context('Scenarios', function () {
      it('User should set the profile URI', async function () {
        await expect(lensHub.setProfileImageURI(FIRST_PROFILE_ID, MOCK_URI)).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        const jsonMetadata = await getJsonMetadataFromBase64TokenUri(tokenURI);
        expect(jsonMetadata.name).to.eq(`@${MOCK_PROFILE_HANDLE}`);
        expect(jsonMetadata.description).to.eq(`@${MOCK_PROFILE_HANDLE} - Lens profile`);
        const expectedAttributes = [
          { trait_type: 'id', value: `#${FIRST_PROFILE_ID.toString()}` },
          { trait_type: 'owner', value: userAddress.toLowerCase() },
          { trait_type: 'handle', value: `@${MOCK_PROFILE_HANDLE}` },
        ];
        expect(jsonMetadata.attributes).to.eql(expectedAttributes);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0x469ce48ea715b49beb948de52681ae0bc8b5184b3793b3e2dbef0893699aca52'
        );
      });

      it('Default image should be used when no imageURI set', async function () {
        await expect(lensHub.setProfileImageURI(FIRST_PROFILE_ID, '')).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        const jsonMetadata = await getJsonMetadataFromBase64TokenUri(tokenURI);
        expect(jsonMetadata.name).to.eq(`@${MOCK_PROFILE_HANDLE}`);
        expect(jsonMetadata.description).to.eq(`@${MOCK_PROFILE_HANDLE} - Lens profile`);
        const expectedAttributes = [
          { trait_type: 'id', value: `#${FIRST_PROFILE_ID.toString()}` },
          { trait_type: 'owner', value: userAddress.toLowerCase() },
          { trait_type: 'handle', value: `@${MOCK_PROFILE_HANDLE}` },
        ];
        expect(jsonMetadata.attributes).to.eql(expectedAttributes);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0xc9222b5027292694589ea3179b0f0bf7da9e271ecbe1bdaed39b6ab8e793a856'
        );
      });

      it('Default image should be used when imageURI does not meet length requirement', async function () {
        const imageURI = 'https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGs';
        await expect(lensHub.setProfileImageURI(FIRST_PROFILE_ID, imageURI)).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        const jsonMetadata = await getJsonMetadataFromBase64TokenUri(tokenURI);
        expect(jsonMetadata.name).to.eq(`@${MOCK_PROFILE_HANDLE}`);
        expect(jsonMetadata.description).to.eq(`@${MOCK_PROFILE_HANDLE} - Lens profile`);
        const expectedAttributes = [
          { trait_type: 'id', value: `#${FIRST_PROFILE_ID.toString()}` },
          { trait_type: 'owner', value: userAddress.toLowerCase() },
          { trait_type: 'handle', value: `@${MOCK_PROFILE_HANDLE}` },
        ];
        expect(jsonMetadata.attributes).to.eql(expectedAttributes);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0xc9222b5027292694589ea3179b0f0bf7da9e271ecbe1bdaed39b6ab8e793a856'
        );
      });

      it('Default image should be used when imageURI does not match expected URI beginning', async function () {
        const imageURI =
          'https://gateway.pinata.cloud/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
        await expect(lensHub.setProfileImageURI(FIRST_PROFILE_ID, imageURI)).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        const jsonMetadata = await getJsonMetadataFromBase64TokenUri(tokenURI);
        expect(jsonMetadata.name).to.eq(`@${MOCK_PROFILE_HANDLE}`);
        expect(jsonMetadata.description).to.eq(`@${MOCK_PROFILE_HANDLE} - Lens profile`);
        const expectedAttributes = [
          { trait_type: 'id', value: `#${FIRST_PROFILE_ID.toString()}` },
          { trait_type: 'owner', value: userAddress.toLowerCase() },
          { trait_type: 'handle', value: `@${MOCK_PROFILE_HANDLE}` },
        ];
        expect(jsonMetadata.attributes).to.eql(expectedAttributes);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0xc9222b5027292694589ea3179b0f0bf7da9e271ecbe1bdaed39b6ab8e793a856'
        );
      });

      it('Default image should be used when imageURI contains double-quotes', async function () {
        const imageURI =
          'https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrztRLMiMPL8wBuTGsMnR" <rect x="10" y="10" fill="red';
        await expect(lensHub.setProfileImageURI(FIRST_PROFILE_ID, imageURI)).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        const jsonMetadata = await getJsonMetadataFromBase64TokenUri(tokenURI);
        expect(jsonMetadata.name).to.eq(`@${MOCK_PROFILE_HANDLE}`);
        expect(jsonMetadata.description).to.eq(`@${MOCK_PROFILE_HANDLE} - Lens profile`);
        const expectedAttributes = [
          { trait_type: 'id', value: `#${FIRST_PROFILE_ID.toString()}` },
          { trait_type: 'owner', value: userAddress.toLowerCase() },
          { trait_type: 'handle', value: `@${MOCK_PROFILE_HANDLE}` },
        ];
        expect(jsonMetadata.attributes).to.eql(expectedAttributes);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0xc9222b5027292694589ea3179b0f0bf7da9e271ecbe1bdaed39b6ab8e793a856'
        );
      });

      it('User should set user two as a dispatcher on their profile, user two should set the profile URI', async function () {
        await expect(lensHub.setDispatcher(FIRST_PROFILE_ID, userTwoAddress)).to.not.be.reverted;
        await expect(
          lensHub.connect(userTwo).setProfileImageURI(FIRST_PROFILE_ID, MOCK_URI)
        ).to.not.be.reverted;
        const tokenURI = await lensHub.tokenURI(FIRST_PROFILE_ID);
        expect(keccak256(toUtf8Bytes(tokenURI))).to.eq(
          '0x469ce48ea715b49beb948de52681ae0bc8b5184b3793b3e2dbef0893699aca52'
        );
      });

      it('User should follow profile 1, user should change the follow NFT URI, URI is accurate before and after the change', async function () {
        await expect(lensHub.follow([FIRST_PROFILE_ID], [[]])).to.not.be.reverted;
        const followNFTAddress = await lensHub.getFollowNFT(FIRST_PROFILE_ID);
        const followNFT = FollowNFT__factory.connect(followNFTAddress, user);

        const uriBefore = await followNFT.tokenURI(1);
        expect(uriBefore).to.eq(MOCK_FOLLOW_NFT_URI);

        await expect(lensHub.setFollowNFTURI(FIRST_PROFILE_ID, OTHER_MOCK_URI)).to.not.be.reverted;

        const uriAfter = await followNFT.tokenURI(1);
        expect(uriAfter).to.eq(OTHER_MOCK_URI);
      });
    });
  });

  context('Meta-tx', function () {
    beforeEach(async function () {
      await expect(
        lensHub.connect(testWallet).createProfile({
          to: testWallet.address,
          handle: MOCK_PROFILE_HANDLE,
          imageURI: MOCK_PROFILE_URI,
          followModule: ZERO_ADDRESS,
          followModuleData: [],
          followNFTURI: MOCK_FOLLOW_NFT_URI,
        })
      ).to.not.be.reverted;
    });

    context('Negatives', function () {
      it('TestWallet should fail to set profile URI with sig with signature deadline mismatch', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetProfileImageURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          '0'
        );

        await expect(
          lensHub.setProfileImageURIWithSig({
            profileId: FIRST_PROFILE_ID,
            imageURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });

      it('TestWallet should fail to set profile URI with sig with invalid deadline', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetProfileImageURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          '0'
        );

        await expect(
          lensHub.setProfileImageURIWithSig({
            profileId: FIRST_PROFILE_ID,
            imageURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: '0',
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_EXPIRED);
      });

      it('TestWallet should fail to set profile URI with sig with invalid nonce', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetProfileImageURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce + 1,
          MAX_UINT256
        );

        await expect(
          lensHub.setProfileImageURIWithSig({
            profileId: FIRST_PROFILE_ID,
            imageURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });

      it('TestWallet should sign attempt to set profile URI with sig, cancel with empty permitForAll, then fail to set profile URI with sig', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetProfileImageURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          MAX_UINT256
        );

        await cancelWithPermitForAll();

        await expect(
          lensHub.setProfileImageURIWithSig({
            profileId: FIRST_PROFILE_ID,
            imageURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });

      it('TestWallet should fail to set the follow NFT URI with sig with signature deadline mismatch', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetFollowNFTURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          '0'
        );

        await expect(
          lensHub.setFollowNFTURIWithSig({
            profileId: FIRST_PROFILE_ID,
            followNFTURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });

      it('TestWallet should fail to set the follow NFT URI with sig with invalid deadline', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetFollowNFTURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          '0'
        );

        await expect(
          lensHub.setFollowNFTURIWithSig({
            profileId: FIRST_PROFILE_ID,
            followNFTURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: '0',
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_EXPIRED);
      });

      it('TestWallet should fail to set the follow NFT URI with sig with invalid nonce', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetFollowNFTURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce + 1,
          MAX_UINT256
        );

        await expect(
          lensHub.setFollowNFTURIWithSig({
            profileId: FIRST_PROFILE_ID,
            followNFTURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });

      it('TestWallet should sign attempt to set follow NFT URI with sig, cancel with empty permitForAll, then fail to set follow NFT URI with sig', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetFollowNFTURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          MAX_UINT256
        );

        await cancelWithPermitForAll();

        await expect(
          lensHub.setFollowNFTURIWithSig({
            profileId: FIRST_PROFILE_ID,
            followNFTURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.be.revertedWith(ERRORS.SIGNATURE_INVALID);
      });
    });

    context('Scenarios', function () {
      it('TestWallet should set the profile URI with sig', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetProfileImageURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          MAX_UINT256
        );

        const tokenURIBefore = await lensHub.tokenURI(FIRST_PROFILE_ID);

        expect(keccak256(toUtf8Bytes(tokenURIBefore))).to.eq(
          '0xb95b30163b08bc4f0c096abf10b220cefc74697c7b2761f9794db082b4bdfd89'
        );

        await expect(
          lensHub.setProfileImageURIWithSig({
            profileId: FIRST_PROFILE_ID,
            imageURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.not.be.reverted;

        const tokenURIAfter = await lensHub.tokenURI(FIRST_PROFILE_ID);

        expect(MOCK_PROFILE_URI).to.not.eq(MOCK_URI);
        expect(tokenURIBefore).to.not.eq(tokenURIAfter);

        expect(keccak256(toUtf8Bytes(tokenURIAfter))).to.eq(
          '0xb67bbdd6959319e9f8da1302a16a24cefbaa34b2a3b02dfc3fd83c2d292966da'
        );
      });

      it('TestWallet should set the follow NFT URI with sig', async function () {
        const nonce = (await lensHub.sigNonces(testWallet.address)).toNumber();
        const { v, r, s } = await getSetFollowNFTURIWithSigParts(
          FIRST_PROFILE_ID,
          MOCK_URI,
          nonce,
          MAX_UINT256
        );

        const followNFTURIBefore = await lensHub.getFollowNFTURI(FIRST_PROFILE_ID);

        await expect(
          lensHub.setFollowNFTURIWithSig({
            profileId: FIRST_PROFILE_ID,
            followNFTURI: MOCK_URI,
            sig: {
              v,
              r,
              s,
              deadline: MAX_UINT256,
            },
          })
        ).to.not.be.reverted;

        const followNFTURIAfter = await lensHub.getFollowNFTURI(FIRST_PROFILE_ID);

        expect(followNFTURIBefore).to.eq(MOCK_FOLLOW_NFT_URI);
        expect(followNFTURIAfter).to.eq(MOCK_URI);
      });
    });
  });
});
