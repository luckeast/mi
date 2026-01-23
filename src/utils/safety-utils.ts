import CryptoJS from 'crypto-js'

/**
 * 安全工具类 - 用于 appConfig 接口的加密解密
 */
export class SafetyUtils {
  /**
   * 获取 App 加密密钥（从域名提取）
   * @param baseUrl - 基础 URL
   * @returns 32位密钥字符串
   */
  static getAppEncryKey(baseUrl: string): string {
    try {
      const url = new URL(baseUrl)
      const domain = url.hostname

      if (domain && domain.length > 0) {
        // 判断是否大于等于32位
        if (domain.length >= 32) {
          return domain.substring(0, 32)
        }
        else {
          // 不足32位，用 '0' 补全
          return domain.padEnd(32, '0')
        }
      }
      return ''
    }
    catch (error) {
      console.error('解析 baseUrl 失败:', error)
      return ''
    }
  }

  /**
   * AES 加密
   * @param plainText - 明文
   * @param key - 密钥
   * @returns Base64 编码的加密字符串
   */
  static encrypt(plainText: string, key: string): string {
    try {
      // AES-ECB 模式，PKCS7 填充
      const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      })
      return encrypted.toString()
    }
    catch (error) {
      console.error('加密失败:', error)
      return plainText
    }
  }

  /**
   * AES 解密
   * @param encryptStr - Base64 编码的加密字符串
   * @param appEncryKey - 密钥
   * @returns 解密后的明文
   */
  static decrypt(encryptStr: string, appEncryKey: string): string {
    try {
      if (!encryptStr || encryptStr.trim().length === 0) {
        throw new Error('加密字符串为空')
      }

      if (!appEncryKey || appEncryKey.length === 0) {
        throw new Error('解密密钥为空')
      }

      // 移除 \r\n 字符
      const cleanStr = encryptStr.replace(/[\r\n]/g, '')

      console.warn('--- AES 解密过程 ---')
      console.warn('清理后的字符串长度:', cleanStr.length)
      console.warn('密钥长度:', appEncryKey.length)

      // Base64 解码
      let encrypted: CryptoJS.lib.WordArray
      try {
        encrypted = CryptoJS.enc.Base64.parse(cleanStr)
        console.warn('Base64 解码成功，数据长度:', encrypted.sigBytes)
      }
      catch (base64Error) {
        console.error('Base64 解码失败:', base64Error)
        throw new Error(`Base64 解码失败: ${base64Error instanceof Error ? base64Error.message : String(base64Error)}`)
      }

      // AES-ECB 解密，PKCS7 填充
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        CryptoJS.enc.Utf8.parse(appEncryKey),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        },
      )

      const result = decrypted.toString(CryptoJS.enc.Utf8)
      console.warn('解密结果长度:', result.length)
      console.warn('解密结果前100个字符:', result.substring(0, 100))

      if (!result || result.length === 0) {
        throw new Error('解密结果为空，可能是密钥错误')
      }

      return result
    }
    catch (error) {
      console.error('❌ AES 解密失败:', error)
      console.error('错误详情:', error instanceof Error ? error.message : String(error))
      // 解密失败时抛出错误，而不是返回原字符串
      // 因为原字符串肯定不是有效的 JSON
      throw error
    }
  }
}

/**
 * AppConfig 解密器
 */
export class AppConfigDecryptor {
  /**
   * 执行第二层解密
   * @private
   */
  private static performSecondLayerDecryption(
    map: any,
    dataMap: any,
    key2: string,
    key3: string,
    key4: string,
  ): any {
    console.warn('========== 第二层解密开始 ==========')
    console.warn('解密前的 map 结构:', {
      code: map.code,
      key: map.key,
      msg: map.msg,
      dataKeys: Object.keys(dataMap),
    })
    console.warn(`使用字段: ${key2}, ${key3}, ${key4}`)
    console.warn(`字段 ${key2} 的值长度:`, String(dataMap[key2]).length)
    console.warn(`字段 ${key3} 的值长度:`, String(dataMap[key3]).length)
    console.warn(`字段 ${key4} 的值长度:`, String(dataMap[key4]).length)

    // 提取并拼接解密密钥（按照文档规则）
    // 1. 从 data[key2] 和 data[key3] 提取 Base64 字符串
    // 2. 分别进行 Base64 解码 → UTF-8 解码
    // 3. 拼接两个解码后的字符串作为解密密钥
    const key2Value = String(dataMap[key2])
    const key3Value = String(dataMap[key3])
    const key4Value = String(dataMap[key4])

    console.warn('原始 Base64 字符串长度:')
    console.warn(`  ${key2} (key2): ${key2Value.length}`)
    console.warn(`  ${key3} (key3): ${key3Value.length}`)
    console.warn(`  ${key4} (key4): ${key4Value.length}`)

    // Base64 解码 → UTF-8 解码
    const keyPart1 = CryptoJS.enc.Base64.parse(key2Value).toString(CryptoJS.enc.Utf8)
    const keyPart2 = CryptoJS.enc.Base64.parse(key3Value).toString(CryptoJS.enc.Utf8)
    const decryptKey = keyPart1 + keyPart2

    console.warn('解码后的密钥组件:')
    console.warn(`  keyPart1 长度: ${keyPart1.length}`)
    console.warn(`  keyPart2 长度: ${keyPart2.length}`)
    console.warn(`  拼接后的解密密钥长度: ${decryptKey.length}`)
    console.warn(`  解密密钥前32个字符: ${decryptKey.substring(0, Math.min(32, decryptKey.length))}`)

    // 提取加密数据（按照文档规则）
    // 1. 从 data[key4] 提取 Base64 字符串
    // 2. Base64 解码 → UTF-8 解码
    // 3. 得到的字符串本身还是 Base64 格式的加密数据
    const encryptedDataBase64 = CryptoJS.enc.Base64.parse(key4Value).toString(CryptoJS.enc.Utf8)
    console.warn('加密数据 (Base64解码→UTF8解码后):')
    console.warn(`  长度: ${encryptedDataBase64.length}`)
    console.warn(`  前100个字符: ${encryptedDataBase64.substring(0, 100)}`)
    console.warn(`  后100个字符: ${encryptedDataBase64.substring(Math.max(0, encryptedDataBase64.length - 100))}`)

    // 解密数据：decrypt 函数内部会再次进行 Base64 解码
    const decryptedData = SafetyUtils.decrypt(encryptedDataBase64, decryptKey)

    console.warn('第二层解密结果长度:', decryptedData.length)
    console.warn('第二层解密结果前200个字符:', decryptedData.substring(0, 200))

    // 检查解密结果是否是有效的 JSON
    const trimmedDecrypted = decryptedData.trim()
    if (!trimmedDecrypted.startsWith('{') && !trimmedDecrypted.startsWith('[')) {
      console.error('第二层解密结果不是有效的 JSON 格式')
      console.error('解密结果:', decryptedData)
      throw new Error(`第二层解密结果不是有效的 JSON 格式，开头字符: ${trimmedDecrypted.substring(0, 50)}`)
    }

    // 解析并替换 data 字段
    try {
      const decryptedDataObj = JSON.parse(decryptedData)
      map.data = decryptedDataObj
      console.warn('✅ 第二层解密成功！')
      console.warn('解密后的 map 结构:', {
        code: map.code,
        key: map.key,
        msg: map.msg,
        dataKeys: Object.keys(map.data),
        dataItemsLength: map.data.items?.length || 0,
      })
      console.warn('最终 data 字段的键:', Object.keys(map.data))
      if (map.data.items) {
        console.warn('data.items 数组长度:', map.data.items?.length || 0)
      }
      console.warn('========== 第二层解密完成 ==========')
      return map
    }
    catch (parseError) {
      console.error('第二层解密结果的 JSON 解析失败')
      console.error('解析的字符串长度:', decryptedData.length)
      console.error('解析的字符串内容:', decryptedData)
      console.error('解析错误:', parseError)
      throw new Error(`第二层解密结果的 JSON 解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
  }

  /**
   * 解密 appConfig 接口响应
   * @param encryptedResponse - 服务器返回的加密字符串（Base64）
   * @param baseUrl - 基础 URL（用于生成密钥）
   * @param key2 - 密钥字段名2（默认: "Booster"）
   * @param key3 - 密钥字段名3（默认: "Fastclean"）
   * @param key4 - 密钥字段名4（默认: "Smartclean"）
   * @returns 解密后的 JSON 对象
   */
  static decryptAppConfigResponse(
    encryptedResponse: string,
    baseUrl: string,
    key2: string = 'ColoringPuzzle',
    key3: string = 'PixelArt',
    key4: string = 'GridColoring',
  ): any {
    try {
      console.warn('--- 开始解密 AppConfig 响应 ---')
      console.warn('加密响应长度:', encryptedResponse.length)
      console.warn('BaseURL:', baseUrl)
      console.warn('密钥字段名:', { key2, key3, key4 })

      // 第一层解密：使用域名密钥解密外层响应
      const appEncryKey = SafetyUtils.getAppEncryKey(baseUrl)
      console.warn('域名密钥:', appEncryKey)
      console.warn('域名密钥长度:', appEncryKey.length)

      if (!appEncryKey || appEncryKey.length === 0) {
        throw new Error('无法从 baseUrl 生成密钥，请检查 baseUrl 配置')
      }

      let firstDecryptStr: string
      try {
        firstDecryptStr = SafetyUtils.decrypt(
          encryptedResponse,
          appEncryKey,
        )
      }
      catch (decryptError) {
        console.error('第一层解密失败:', decryptError)
        throw new Error(`第一层解密失败: ${decryptError instanceof Error ? decryptError.message : String(decryptError)}`)
      }

      console.warn('第一层解密结果长度:', firstDecryptStr.length)
      console.warn('第一层解密结果前200个字符:', firstDecryptStr.substring(0, 200))
      console.warn('第一层解密结果后200个字符:', firstDecryptStr.substring(Math.max(0, firstDecryptStr.length - 200)))

      // 检查解密结果是否有效
      if (!firstDecryptStr || firstDecryptStr.trim().length === 0) {
        throw new Error('第一层解密结果为空')
      }

      // 检查是否是有效的 JSON 格式
      const trimmedStr = firstDecryptStr.trim()
      if (!trimmedStr.startsWith('{') && !trimmedStr.startsWith('[')) {
        console.error('第一层解密结果不是有效的 JSON 格式')
        console.error('解密结果:', firstDecryptStr)
        throw new Error(`第一层解密结果不是有效的 JSON 格式，开头字符: ${trimmedStr.substring(0, 50)}`)
      }

      let map: any
      try {
        map = JSON.parse(firstDecryptStr)
      }
      catch (parseError) {
        console.error('JSON 解析失败')
        console.error('解析的字符串长度:', firstDecryptStr.length)
        console.error('解析的字符串内容:', firstDecryptStr)
        console.error('解析错误:', parseError)
        throw new Error(`JSON 解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
      }
      console.warn('第一层解密后的结构:', {
        code: map.code,
        key: map.key,
        msg: map.msg,
        hasData: !!map.data,
        dataType: typeof map.data,
        isDataArray: Array.isArray(map.data),
      })

      // 第二层解密：解密 data 字段
      if (map.data && typeof map.data === 'object' && !Array.isArray(map.data)) {
        const dataMap = map.data
        const dataKeys = Object.keys(dataMap)
        console.warn('data 字段的所有键:', dataKeys)

        // 检查必要的字段是否存在
        const hasKey2 = !!dataMap[key2]
        const hasKey3 = !!dataMap[key3]
        const hasKey4 = !!dataMap[key4]

        console.warn(`字段检查: ${key2}=${hasKey2}, ${key3}=${hasKey3}, ${key4}=${hasKey4}`)

        if (!hasKey2 || !hasKey3 || !hasKey4) {
          console.warn('⚠️ 缺少默认解密字段 (Booster/Fastclean/Smartclean)，尝试自动检测...')
          console.warn(`当前配置的字段名: key2=${key2}, key3=${key3}, key4=${key4}`)
          console.warn(`字段存在情况: key2=${hasKey2}, key3=${hasKey3}, key4=${hasKey4}`)

          // 尝试自动检测字段名：查找 Base64 编码的字符串字段
          const base64Fields: string[] = []
          for (const key of dataKeys) {
            const value = dataMap[key]
            if (typeof value === 'string' && value.length > 10) {
              // 检查是否是 Base64 格式
              try {
                const decoded = CryptoJS.enc.Base64.parse(value)
                if (decoded.sigBytes > 0) {
                  base64Fields.push(key)
                }
              }
              catch {
                // 不是 Base64 格式
              }
            }
          }
          console.warn('自动检测到的 Base64 字段:', base64Fields)

          // 如果找到 3 个 Base64 字段，使用它们
          if (base64Fields.length >= 3) {
            const detectedKey2 = base64Fields[0]
            const detectedKey3 = base64Fields[1]
            const detectedKey4 = base64Fields[2]
            console.warn(`✅ 自动检测到字段: ${detectedKey2}, ${detectedKey3}, ${detectedKey4}`)

            // 使用检测到的字段名继续解密
            return this.performSecondLayerDecryption(map, dataMap, detectedKey2, detectedKey3, detectedKey4)
          }
          else if (base64Fields.length >= 2) {
            // 如果只有 2 个字段，使用第一个字段作为 key2 和 key3，第二个字段作为 key4
            const detectedKey2 = base64Fields[0]
            const detectedKey3 = base64Fields[0] // 重复使用第一个字段
            const detectedKey4 = base64Fields[1]
            console.warn(`⚠️ 只找到 2 个 Base64 字段，使用: ${detectedKey2} (作为key2和key3), ${detectedKey4} (作为key4)`)

            // 使用检测到的字段名继续解密
            return this.performSecondLayerDecryption(map, dataMap, detectedKey2, detectedKey3, detectedKey4)
          }
          else if (base64Fields.length === 1) {
            // 如果只有 1 个字段，可能这个字段本身就是加密数据，需要特殊处理
            console.warn('⚠️ 只找到 1 个 Base64 字段，可能需要特殊处理')
          }

          console.warn('❌ 无法自动检测字段，返回第一层解密结果')
          return map
        }

        // 所有字段都存在，执行第二层解密
        return this.performSecondLayerDecryption(map, dataMap, key2, key3, key4)
      }

      console.warn('--- 解密完成 ---')
      console.warn('最终返回结构:', {
        code: map.code,
        key: map.key,
        msg: map.msg,
        hasData: !!map.data,
        dataKeys: map.data ? Object.keys(map.data) : [],
        dataItemsLength: map.data?.items?.length || 0,
      })

      // 确保返回的结构包含 code、key、msg 和 data
      if (!map.code && !map.key && !map.msg) {
        console.warn('⚠️ 警告：返回结构可能不正确，缺少 code、key、msg 字段')
      }

      return map
    }
    catch (error) {
      console.error('解密 appConfig 响应失败:', error)
      console.error('错误详情:', error instanceof Error ? error.message : String(error))
      // 解密失败时返回原始响应
      return { data: encryptedResponse }
    }
  }
}
