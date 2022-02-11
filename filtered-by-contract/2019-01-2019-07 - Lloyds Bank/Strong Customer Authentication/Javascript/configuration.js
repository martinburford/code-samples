import { LLOYDS, HALIFAX, BOS, MBNA } from '@lbg/constellation';

export default {
  animationTime: process.env.NODE_ENV === 'test' ? 0 : 0,
  constellationViewports: {
    mobile: {
      minWidth: 1,
      maxWidth: 649,
    },
    tablet: {
      minWidth: 650,
      maxWidth: 1024,
    },
    desktop: {
      minWidth: 1025,
      maxWidth: 9999,
    },
  },
  viewports: {
    mobile: {
      width: 375,
      height: 667,
    },
    tablet: {
      width: 1024,
      height: 768,
    },
    desktop: {
      width: 1280,
      height: 800,
    },
  },
  brands: [LLOYDS, HALIFAX, BOS, MBNA],
  channels: ['retail', 'o4b', 'cbo'],
  journeys: [
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      url: '/ecommerce',
      items: [
        {
          id: 'lottie-demo',
          name: 'Lottie demo',
          url: '/lottie-demo',
        },
      ],
    },
    {
      id: 'experiments',
      name: 'Experiments',
      url: '/experiments',
      items: [
        {
          id: 'cta-user-id',
          name: 'CTAs on User ID',
          url: '/cta-user-id',
          items: [
            {
              id: 'login-no-app',
              url: '/login-no-app',
              name: '[ Log In Experimental ] SC1 No App',
            },
            {
              id: 'login-appsign',
              url: '/login-appsign',
              name: '[ Log In Experimental ] SC2 App Sign',
            },
            {
              id: 'login-strong-device',
              url: '/login-strong-device',
              name: '[ Log In Experimental ] SC3 Strong Device',
            },
          ],
        },
        {
          id: 'statements-step-up',
          name: 'Statements Step Up',
          url: '/statements-step-up',
          items: [
            {
              id: 'statements',
              url: '/statements',
              name:
                '[ Statements ] Log In MI, Statements step-up AppSign/SMS-OTP',
            },
          ],
        },
      ],
    },
    {
      id: 'customer-testing',
      name: 'Customer Testing',
      url: '/customer-testing',
      items: [
        {
          id: '18-12-07',
          name: '7 December 2018 - Login',
          url: '/18-12-07',
          items: [
            {
              id: 'journey-1',
              name:
                '[ Log In ] Appsign OR Password + MI + SMS-OTP/EIA + Device Reg',
              url: '/journey-1',
            },
            {
              id: 'journey-2',
              name:
                '[ Log In ] No Appsign, Password + MI + SMS-OTP/EIA + Device Reg',
              url: '/journey-2',
            },
            {
              id: 'journey-3',
              name: '[ Log In ] Appsign OR Password + MI + Strong Device',
              url: '/journey-3',
            },
          ],
        },
        {
          id: '18-10-18',
          name: '18 October 2018 - Strong Device',
          url: '/18-10-18',
          items: [
            {
              id: 'ct-journey-1',
              url: '/ct-journey-1',
              name: '[ Log In Galaxy ] CT1 Browser Update (variation A)',
            },
            {
              id: 'ct-journey-1-b',
              url: '/ct-journey-1-b',
              name: '[ Log In Galaxy ] CT1 Browser Update (variation B)',
            },
            {
              id: 'ct-journey-2',
              url: '/ct-journey-2',
              name: '[ Log In Galaxy ] CT2 Device Registration (variation A)',
            },
            {
              id: 'ct-journey-2-b',
              url: '/ct-journey-2-b',
              name: '[ Log In Galaxy ] CT2 Device Registration (variation B)',
            },
            {
              id: 'ct-journey-3',
              url: '/ct-journey-3',
              name: '[ Log In Galaxy ] CT3 Strong Device',
            },
          ],
        },
      ],
    },
    {
      id: 'logon',
      name: 'Logon',
      url: '/logon',
      items: [
        {
          id: 'june-2019-mvp',
          name: 'June 2019 - MVP',
          url: '/june-2019-mvp',
          items: [
            {
              id: 'existing-logon',
              name: 'Existing logon',
              url: '/existing-logon',
              steps: [
                'Homepage',
                'User ID / Password',
                'Memorable Information',
                'Account Overview',
              ],
            },
            {
              id: 'existing-logon-password-mi',
              name: 'Existing logon + Password MI',
              url: '/existing-logon-password-mi',
            },
            {
              id: 'existing-logon-sdid',
              name: 'Existing logon + SDID (v2)',
              url: '/existing-logon-sdid',
            },
          ],
        },
        {
          id: 'september-2019-compliance',
          name: 'September 2019 - Compliance',
          url: '/september-2019-compliance',
          items: [
            {
              id: 'postal-otp',
              name: 'Postal OTP',
              url: '/postal-otp',
            },
            {
              description:
                'This journey includes 3x custom error pages - EIAFraud / EIAInvalidCode / EIANoAnswer',
              id: 'with-token-appsign-smsotp-eia-sdid-(v2)-eia-errors',
              name:
                'With Token + App Sign + SMSOTP + EIA + SDID (v2) + EIA errors',
              url: '/with-token-appsign-smsotp-eia-sdid-v2-eia-errors',
            },
            {
              description:
                'This page includes the single page version of Strong Device ID (SDID)',
              id: 'without-appsign-smsotp-eia-sdid-(v2)',
              name: 'Without App Sign + SMSOTP + EIA + SDID (v2)',
              url: '/without-appsign-smsotp-eia-sdid-v2',
            },
            {
              id: 'with-strong-device-check',
              name: 'With Strong Device Check',
              url: '/with-strong-device-check',
            },
          ],
        },
      ],
    },
    {
      id: 'payments',
      name: 'Payments',
      url: '/payments',
      items: [
        {
          id: 'ib-payments',
          name: 'IB Payments',
          url: '/ib-payments',
        },
      ],
    },
  ],
};
