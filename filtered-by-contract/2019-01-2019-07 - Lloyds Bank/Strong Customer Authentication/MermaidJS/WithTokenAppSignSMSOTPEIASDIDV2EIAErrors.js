/**
 * Supporting documentation for MermaidJS flowcharts: https://mermaidjs.github.io/flowchart.html
 */

/**
 * START: Start
 * USER_ID_PASSWORD: User ID / Password
 * MI: Memorable Information
 * CONTINUE_TOKEN: Continue with Token
 * TOKEN: Token
 * HAVING_TROUBLE_TOKEN: Having trouble (Token)
 * CONTINUE_APP_SIGN: Contine with App Sign
 * CHECK_YOUR_DEVICE: Check your device
 * HAVING_TROUBLE_APP_SIGN: Having trouble (App Sign)
 * SMS_SELECTION: SMS selection
 * SMS_OTP: SMS OTP
 * HAVING_TROUBLE_SMS_OTP: Having trouble (SMS OTP)
 * EIA_SELECTION: EIA selection
 * EIA: EIA
 * HAVING_TROUBLE_EIA: Having trouble (EIA)
 * CONNECT: Connect
 * ACCOUNT_OVERVIEW: Account overview
 * SDID: Strong Device ID
 * SDID_DEVICE_NOT_REGISTERED: SDID device not registered
 * SDID_NOT_TRUSTED: SDID trusted
 * SDID_TRUSTED: SDID Device trusted
 */
const basePath =
  '/lloyds/retail/logon/september-2019-compliance/with-token-appsign-smsotp-eia-sdid-v2-eia-errors';
const Logon = `
  graph TD;
    START(Start)                            --> USER_ID_PASSWORD[User ID / Password];
    USER_ID_PASSWORD                        -- Continue --> MI[Memorable Information];
    MI                                      -. Cancel .-> USER_ID_PASSWORD;
    MI                                      -- Continue --> CONTINUE_TOKEN[Continue with Token];
    CONTINUE_TOKEN                          -. Cancel .-> USER_ID_PASSWORD;
    CONTINUE_TOKEN                          -- Verify another way --> CONTINUE_APP_SIGN[Continue with App Sign];
    CONTINUE_TOKEN                          -- Continue --> TOKEN[Token];
    TOKEN                                   -- Having trouble --> HAVING_TROUBLE_TOKEN[Having trouble - Token];
    TOKEN                                   -- Continue --> SDID[Strong Device ID];
    HAVING_TROUBLE_TOKEN                    -. Cancel .-> USER_ID_PASSWORD;
    HAVING_TROUBLE_TOKEN                    -- Verify another way --> CONTINUE_APP_SIGN[Continue with App Sign];
    HAVING_TROUBLE_TOKEN                    -. Retry .-> CONTINUE_TOKEN;
    CONTINUE_APP_SIGN                       -. Cancel .-> USER_ID_PASSWORD;
    CONTINUE_APP_SIGN                       -- Verify another way --> SMS_SELECTION[SMS selection]
    CONTINUE_APP_SIGN                       -- Continue --> CHECK_YOUR_DEVICE[Check your device]
    CHECK_YOUR_DEVICE                       -- Having trouble --> HAVING_TROUBLE_APP_SIGN[Having trouble - App Sign]
    CHECK_YOUR_DEVICE                       -- Continue --> SDID
    HAVING_TROUBLE_APP_SIGN                 -. Cancel .-> USER_ID_PASSWORD
    HAVING_TROUBLE_APP_SIGN                 -- Verify another way --> SMS_SELECTION
    HAVING_TROUBLE_APP_SIGN                 -. Retry .-> CHECK_YOUR_DEVICE
    SMS_SELECTION                           -. Cancel .-> USER_ID_PASSWORD
    SMS_SELECTION                           -- Verify another way --> EIA_SELECTION[EIA selection]
    SMS_SELECTION                           -- Selection --> SMS_OTP[SMS OTP]
    SMS_OTP                                 -- Having trouble --> HAVING_TROUBLE_SMS_OTP[Having trouble - SMS OTP]
    SMS_OTP                                 -- Continue --> SDID
    HAVING_TROUBLE_SMS_OTP                  -. Cancel .-> USER_ID_PASSWORD
    HAVING_TROUBLE_SMS_OTP                  -- Verify another way --> EIA_SELECTION            
    HAVING_TROUBLE_SMS_OTP                  -. Retry .-> SMS_SELECTION
    EIA_SELECTION                           -. Cancel .-> USER_ID_PASSWORD
    EIA_SELECTION                           -- Verify another way --> CONNECT[Connect]
    EIA_SELECTION                           -- Selection --> EIA[EIA]
    EIA                                     -- Having trouble --> HAVING_TROUBLE_EIA[Having trouble - EIA]
    EIA                                     -- Continue --> SDID
    HAVING_TROUBLE_EIA                      -. Cancel .-> USER_ID_PASSWORD
    HAVING_TROUBLE_EIA                      -- Verify another way --> CONNECT
    HAVING_TROUBLE_EIA                      -. Retry .-> EIA_SELECTION
    SDID                                    -- Ask me next time --> ACCOUNT_OVERVIEW[Account overview]
    SDID                                    -- Continue - Do not trust --> SDID_NOT_TRUSTED[SDID not trusted]
    SDID                                    -- Continue - Trust --> SDID_TRUSTED[SDID trusted]
    SDID                                    -- Continue - Device not registered --> SDID_DEVICE_NOT_REGISTERED[SDID device not registered]
    SDID_DEVICE_NOT_REGISTERED              -- Continue to accounts --> ACCOUNT_OVERVIEW
    SDID_NOT_TRUSTED                        -- Continue to accounts --> ACCOUNT_OVERVIEW
    SDID_TRUSTED                            -- Continue to accounts --> ACCOUNT_OVERVIEW
    
    class START,CONNECT,ACCOUNT_OVERVIEW customStartEnd;
    class USER_ID_PASSWORD,MI,CONTINUE_TOKEN,TOKEN,HAVING_TROUBLE_TOKEN,CONTINUE_APP_SIGN,CHECK_YOUR_DEVICE,HAVING_TROUBLE_APP_SIGN,SMS_SELECTION,SMS_OTP,HAVING_TROUBLE_SMS_OTP,EIA_SELECTION,EIA,HAVING_TROUBLE_EIA,SDID,SDID_DEVICE_NOT_REGISTERED,SDID_NOT_TRUSTED,SDID_TRUSTED custom;

    click START "${basePath}" "START"
    click USER_ID_PASSWORD "${basePath}/user-id" "USER_ID_PASSWORD"
    click MI "${basePath}/mi" "MI"
    click CONTINUE_TOKEN "${basePath}/continue-with-token" "CONTINUE_TOKEN"
    click TOKEN "${basePath}/token" "TOKEN"
    click HAVING_TROUBLE_TOKEN "${basePath}/having-trouble-token" "HAVING_TROUBLE_TOKEN"
    click CONTINUE_APP_SIGN "${basePath}/continue-with-app-sign" "CONTINUE_APP_SIGN"
    click CHECK_YOUR_DEVICE "${basePath}/check-your-device" "CHECK_YOUR_DEVICE"
    click HAVING_TROUBLE_APP_SIGN "${basePath}/having-trouble-app-sign" "HAVING_TROUBLE_APP_SIGN"
    click SMS_SELECTION "${basePath}/sms-selection" "SMS_SELECTION"
    click SMS_OTP "${basePath}/sms-otp" "SMS_OTP"
    click HAVING_TROUBLE_SMS_OTP "${basePath}/having-trouble-sms-otp" "HAVING_TROUBLE_SMS_OTP"
    click EIA_SELECTION "${basePath}/eia-selection" "EIA_SELECTION"
    click EIA "${basePath}/eia" "EIA"
    click HAVING_TROUBLE_EIA "${basePath}/having-trouble-eia" "HAVING_TROUBLE_EIA"
    click CONNECT "${basePath}/connect" "CONNECT"
    click SDID "${basePath}/sdid" "SDID"
    click SDID_DEVICE_NOT_REGISTERED "${basePath}/device-not-registered" "SDID_DEVICE_NOT_REGISTERED"
    click SDID_NOT_TRUSTED "${basePath}/sdid-not-trusted" "SDID_NOT_TRUSTED"
    click SDID_TRUSTED "${basePath}/sdid-trusted" "SDID_TRUSTED"
    click ACCOUNT_OVERVIEW "${basePath}/account-overview" "ACCOUNT_OVERVIEW"
  `;

export default Logon;
