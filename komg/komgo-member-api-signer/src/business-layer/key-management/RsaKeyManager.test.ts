import 'reflect-metadata'

import KeyCreationError from './exceptions/KeyCreationError'
import { RsaKeyManager } from './RsaKeyManager'

describe('RsaKeyManager', () => {
  let manager: RsaKeyManager
  let keyDataAdapterMock
  let vaultClientMock

  const mockPrivateKey = {
    d:
      'o1iAMHDOInH5rCBgDqD7iA9brPaGukJCfv611_mBHG33LJm9bJbpA2qse4Q_-eZYmMjKdh3rlhacdakcjr6AI6FGWed4E5SU6_Igk6uevoRoQnoedN5AOlpxr6l-_dwk_rP2RP0jcu2U8Y1_V-T_tJy8XR6AB2QMLt_CYHFeUHzbcc4MLBZri0ABNS9TdvLm-ncmrHkQhhLqwulwTaF6BzbaoChTJHmVA8XG5aZBTx-bBZrmDUyBTcppz9jvil-9rWOgHASAn_T7PR9efAJvH6Q-om2NMvL205WQ42OMLJwvoi77YwIE_D-nAgUMcgPXsjs9TwmJyyhWH1CdFlU',
    dp:
      'goAOZn-yhbOiLM5SyZkN5e44l0EWtOZLsTavjMgZNuWEVM7kCSBKzU_mYfRpBOw1gtCKRJsBRo-0AMl1Iyee5j97czWE46T1O8VekWgYpbyfJK-YETP2vcR7JdGQLrt-VqipG1LGcHcEJUUAvLoI_bk_INphZHfe5nNI2vK0GGM',
    dq:
      'K7iaqW6MHy92YtV00ek6lxJFEqbzwnfXkik81Nvk1YZPAkc9wbRcsBa4IZ-qz1XYpFse7LqmPAROewJNWV9UeN3xDdA2rxlOnh3WgBQa7wyPovyEFBfTEYz5J1XMlsiSdSyxQKDh7qfyL-fddwf4Az3Lnq2fVcTpsjADcAMJCYM',
    e: 'AQAB',
    kid: 'mgCffw2gKbBM4mkaNbCxijKD7XuWuwvQACKQOHliPek',
    kty: 'RSA',
    n:
      'o1kjiPD-k0AcHhoMLwEKKQrjvFIzsMj8wUE01q9ZFe8TmpDqBlRVmlOv5jC7fiZSfyFjPuhhtAIyjEWSN9sO4iFp-y3R-wyogIcMhcwyaiMmxuJg7vy1GJqsChsup1si2tj0-PNocBEH3yJw5WRXmZxw-drdJeQTkuvxQDO-wdzFSOzILiOK60DzPkOIRjU1ZWJc5AjQbx1W6cEw2M0PZtGZw8_WBCi6YV-FzWRJ2o_4vTfgpkBqJG7LsuJVaIt-252GkXOzbQbNDg-ttZ0DqCD0yb4dahM12yg0KSMefIX5exUTScDDUQABkwFte3IZpIsYrS8Ekv3VufAUA-xZ6Q',
    p:
      '1VnNBE-t_Fkfry45-PyusSOA840qKttxfAOoYREOqZgeXJSzF5lJDFYIH0jDX1VT3NAXiKOStJEveJkmtcq28s1morYlL_cQpzsEJkhXmoUhZrzxu20X89yGTUOB8KiTGUAsKo5oo1CdovYyhnIAxw57lasKbxaLmjgnr01jHO8',
    q:
      'xAB2ReRS9vB1t5rZBqNAJlSDSDM-6JSIahBEnJCsniYCW1gZyx4S9I38m9kzw4_bMcfqbFp7Jvjzm3944DqFRAEVllup5tGAiqDw69HkfgDsL8YgMlx7GDgVgmysvkPKg_yKSylauAIdu1si2JJhCN_8k3fdvKfAGjohqE-XJqc',
    qi:
      'xyDtuGBVkiguzVNkQDGXqzXExaR097UQEAPPcm56-_O8qkno9-co97n8TVdIoiaLXnCFEZZr-_WoLbm1gSzqT57M4yoJ-H-iHpNAMJNeCtW7qWlfzLulMIpwrP1r09oKTsEFybxKFSfpFzSwSvO6sB0ihWvE4DeFHPWK_KUeujE'
  }
  const mockKey = {
    data:
      'eyJhbGciOiJQQkVTMi1IUzUxMitBMjU2S1ciLCJwMnMiOiJBZ3NWY1dyRXNTUmlrb1JielpGRmFnIiwicDJjIjo4MTkyLCJjdHkiOiJqd2stc2V0K2pzb24iLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiNUtJRnFwVWVxOEVkb2w5ZHJpeW9hWXhNbUxZaFRSblRwQUFHRGlRdFFRNCJ9.lbCzgug4EGS27IZRs9qXmw8RPRbKXUQ1rSsynZ_4DRkTEn1xKWoh6Q.d3G9HUtbTEnjHa4U.K4YqPAw6DlYSO5OlXNO_R0FbvAeEmFGTixPn_lC1wsY_UCAeujM_jOkv9NDBfiJh2poKnairU7M10YlCkWlgAaHECMRl87E7nreVVfzrpDf0qD6h6OImK-ez78w4teN0QmjeVXt51koSz2Heu14k2SilKH8aKRHIOz5mF7NV_mwji0sbsRmTBqXY-0XSbrbHXit6uUKbsHMZcSOX0Rzu3xS1cuwV7LoR5Nwu8Xgt67n4iTpDIC4R-N4d9LyZpNxQZXykZaZ35lxx2Fdg93Yo9Labiei_1VP34hvT7g4Heg1I8gp7laASXiHIkZyLwu-zfQ1RBjEgyljt4W3qBDRPrA6NKeYsmZlQuvWUxtBvxxb_S2BaofoTyUn30A0X_eXxOIZmU5JPsEMbgOUFp_GFAPiFW4ZicoUQSP9mR2YfsSn04cY8PdAWeqlSi_hE845MJYCwa8MP0S4_QnOmcWgHhs82-zt5O-njRhnISv1OOkqUdo0SMl0FoH_OHBY6-8Myq7ExBsvFCRsdgimzr5oj4spaD1vOWDdgb66XTPzEzN7k1fxKVA8cNBA9x87oBAZNpELvX1MpkCM7lsQCSTmm3xhaeX7i66_MmXVzNcznEaUCICy-4Xu96PmFC5bMsISTzjzqkmieo8DqHIFNGrj_s-_YMAyFMa7hancbBhi5ihgPp_adr-ePar4beT9o-0D-5tEXeOxZXyktZfpZnsUIzUfFDoamBDO8za5-K7vlnBQ0IAcpSOhU65041kEmhZ9lqkg6fIp9zMTnOBgtSZAXco8BRAV2XmAeg78XNFbhuJFP0M1oKLvdI6cT8_-E56DDaEVpD04blUiwbHfblpqSd8q0tfrdxvX-GmXgvq_mCejjQjqdCi0TWY5iK8_UekkzX24T9i7Ovscm5a1Z1ZUG5y0qoabwxD-UzplpfoD5R2ZJNlCzc05Wwv72YVZOsllveUhF_IlyruG_WYywXMrqA4QO3gDHDO9VrAsXlpk86PrUCrhc7T52LoSE7PWi5ShdXQfDNeXezxQcIHna4PVeg2l5vVrsb44aE0tmK7hc7ak196Jblo1Zig7n_P_nJbxSSu4-Bdaah0A5aT-jOq8dbwxyFUu5JOvyekkh2bMqbhiK-UWV0-k86XYEnTR7pjpDLjMFJxd6DATZRzuDoit3gWPTAnEWlKSJWlUOFIVQj8bp6VvSYQrtiWTxVZ_-wMEPsLdG_reIgk0LaL_1-P3NWHfrhPF8SmOMBIgBtKNRHxfXZEobcELzNYNCoN47O1wv01IDTOvJuqEXjxET1u89CDAYxc-gxnisp_LK3H7-a5fdw0U-CcNNbMrcSHQg1mVvF4oltgxJ_ZFWqZh3DIquunLssL0mOrQ2VCqYcN0bSR1uvecLVCtOZSWa7liRb8GaXnwiDOiqMxIA-U9u4M23nwyVFBI_CinEboQxlgTf9W-BO592CEycg7blbmSX-Z8ctOKYRWS_PF3pEi8szhuRwtwBRde9A0kb79FobR6Q9nrXgmFLZwybYqH0E4BwtxLDvyu0Pc-nktCO-irKQ6uXSIMC6n0iqqOI1URmfdDUqgNNy22Z2ogO7tZyb4Y_ejQjUwiSHwiejZN-GoCuyKwJGppwTj9F_5zM6z_yMdRuj6yxjbMsEcM39BeWqldmTIeFZOeYYDiJle_rmu_lhBM2kA3-Wu_VbLSt1UWoMEaq5ldtQPx4iRKdSy4gKYrLPCWJQTns4uigO-EUYRUZAlvNFAPC_HDqkIm63-JC7WCgBXx_oH2_H1vUxVb6x8qL8HZRTTHybuO66LYMX52tWPyO4D6ditNC-XNTeGV3X06N2tz-RSxx7sWrdRGyAKjSLdJiYWz5qNIJ05gculoa9gb3gPdP4bu4ioG8A4659INSqO8-zLUVvXgxLnwte_bpL09-G2QyfoGHY7Xn9jLj--RxOWjuFcxzHiyREb5-4tITob15BTs1VMaogfaM0MPz3yATX07l_XO2KYJJVTM4RFE2NF5yeOx7v22_Gww7vGqH-I2ySRrfTuH1QF8jkhK_IC6Kz_7GxtsZHdEmnElU6RgAN7Kwraz2Wv-4ng4Jt8atDIOMVfHDCiFe3MxnEEaNsJ9iPejN05jrFgJ8GAsE6E26GGDYXxWIjUCkJK8DtryVMgzOMwxExwgZjyLghPcfQNJDyxmZy19un-zv2ha-X0_HrcNp7R_rK1ocZILYvY5dFouX6io.jPIW15hMtnnbHoOvkDp8Tw'
  }

  const mockRsa1024 = {
    d:
      'EL3bS5RvkiJnooMK77jheQMnji-ZANmSoYN87e-6rkndvtjufbpnoMmgHxwLR8sje8X1raT-tc-UWbl-EqN0Q_RAKkFTTqcw2BcgzrmfxTpOYXKciV9R2_u8STChpNWmHj1m7keNPlWt0pQtS3DLNRLcoSG1gVKERz5L0AZnN-E',
    dp: 'sUeSLKt9_mzhO7JYFxNUPsJLLr0JNtacO9qcO8RUG8OcWW8_45OxRUg7DfvT_aB5dxUYUFkLGNmc7JnkzrfTBQ',
    dq: 'juBn5hEi1D6xD7rydJXNvwVOco3BVR4A6bWNPpj-JkPsNAi70301JQeO3B8XF0ib77AwkqVFhu1QE6WlEWZy5w',
    e: 'AQAB',
    kid: 'd262aOaDWHIkXpphJTw1RRTdBbCuzJW6pR7j81WIj_4',
    kty: 'RSA',
    n:
      'nhjv-FFE2nKQfFYTSJaLpwzbmr_JILQj0jCiW6cyiWO-zxyslaYxGsC8AaEQ0JP3ZuVYz43048E5Jm5cOU5PEkQ3Dw7pprGcHvYikKC3CzYRSGzZU_7PEQrYjQSj5WUdNMSU2o9h0OQZHyyYLTfRa7kNjR_JCbt9s4QbN5QNggc',
    p: '1OVd6NgFo13vWYs43aecEtA0F-MtsbAu_wrU8-n9Sf-nRUdqsMNRJOkuFviaK7GefdVDMgkWpvRqvTzCYK8JlQ'
  }

  beforeEach(() => {
    keyDataAdapterMock = {
      getActiveKey: jest.fn(),
      addNewKey: jest.fn(() => Promise.resolve(true))
    }

    vaultClientMock = {
      isAvailable: jest.fn(),
      storeEthKey: jest.fn(),
      readEthKey: jest.fn()
    }

    process.env.RSA_KEYSTORE_PASSPHRASE = 'env.passphrase'

    manager = new RsaKeyManager(keyDataAdapterMock, vaultClientMock)
  })

  // it('uses env passphrase if not specified', async () => {
  //     await manager.createNewKeyAndSave(null, null)
  // })

  it('generates new key with new default', async () => {
    await manager.createNewKeyAndSave()
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
  }, 10000)

  it('generates new key with new passphrase', async () => {
    await manager.createNewKeyAndSave('passphase')
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
  }, 15000)

  it('fails if invalid private key', async () => {
    let error
    try {
      await manager.createNewKeyAndSave(null, mockRsa1024)
    } catch (err) {
      expect(err).toEqual(new KeyCreationError('Key must be RSA 2048'))
      error = err
    }

    expect(error).toBeDefined()
  }, 10000)

  it('creates key from private key', async () => {
    const pubKey = await manager.createNewKeyAndSave('passphase', mockPrivateKey)
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
    expect(mockPrivateKey).toMatchObject(pubKey)
  }, 10000)

  it('return no key', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => null)
    const key = await manager.getActiveKeyData('passphrase')

    expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
    expect(key).toBeNull()
  })

  it('return rsa key', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => mockKey)
    const key = await manager.getActiveKeyData('passphrase')

    expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
    expect(key).toEqual(key)
  })

  it('fails on invalid passpharse', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => mockKey)
    try {
      await manager.getActiveKeyData('__invalid__')
    } catch (err) {
      expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
      expect(err.message).toBe('Error parsing RSA key data')
    }
  })

  it('fails on invalid data', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => ({ data: { invalid: '' } }))
    try {
      await manager.getActiveKeyData('__invalid__')
    } catch (err) {
      expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
      expect(err.message).toBe('Error parsing RSA key data')
    }
  })
})
