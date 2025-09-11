import { test, expect } from '@playwright/test'

test.describe('Simple Authentication Diagnostics', () => {
  test('should identify root cause of authentication failures', async ({ page }) => {
    console.log('=== AUTHENTICATION FAILURE DIAGNOSIS ===\n')
    
    // Track all network requests
    const networkRequests: Array<{url: string, method: string, status: number, error?: string}> = []
    const consoleMessages: Array<{type: string, message: string}> = []
    
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status()
      })
    })
    
    page.on('requestfailed', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: 0,
        error: request.failure()?.errorText || 'Unknown error'
      })
    })
    
    page.on('console', message => {
      consoleMessages.push({
        type: message.type(),
        message: message.text()
      })
    })
    
    // 1. Test basic page accessibility
    console.log('1. Testing basic page accessibility...')
    try {
      await page.goto('https://simple-todo-app-bmad.vercel.app/auth/register', { waitUntil: 'networkidle' })
      console.log('✅ Registration page loads successfully')
    } catch (error) {
      console.log('❌ Registration page failed to load:', error)
      return
    }
    
    // 2. Check if environment variables are accessible
    console.log('\n2. Checking environment configuration...')
    const envCheck = await page.evaluate(() => {
      // Try to access Supabase configuration
      try {
        const scripts = Array.from(document.scripts)
        const configScript = scripts.find(script => script.innerHTML.includes('NEXT_PUBLIC_SUPABASE'))
        
        return {
          hasConfigInScripts: !!configScript,
          windowSupabase: !!(window as any).supabase,
          nextDataExists: !!(window as any).__NEXT_DATA__,
          documentTitle: document.title
        }
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'Unknown error' }
      }
    })
    
    console.log('Environment Check:', JSON.stringify(envCheck, null, 2))
    
    // 3. Test form submission and capture network activity
    console.log('\n3. Testing form submission...')
    
    const testData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
      familyName: 'Test Family'
    }
    
    console.log('Filling form with test data:', { ...testData, password: '[HIDDEN]' })
    
    await page.fill('input[name="name"]', testData.name)
    await page.fill('input[name="email"]', testData.email)
    await page.fill('input[name="password"]', testData.password)
    await page.fill('input[name="confirmPassword"]', testData.password)
    await page.fill('input[name="familyName"]', testData.familyName)
    
    // Submit form and wait for response
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    
    // 4. Analyze network requests
    console.log('\n4. Network Analysis:')
    const authRequests = networkRequests.filter(req => req.url.includes('/api/auth/'))
    const failedRequests = networkRequests.filter(req => req.status >= 400 || req.error)
    
    console.log(`Total requests: ${networkRequests.length}`)
    console.log(`Auth API requests: ${authRequests.length}`)
    console.log(`Failed requests: ${failedRequests.length}`)
    
    if (authRequests.length > 0) {
      console.log('\nAuth API Requests:')
      authRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url} → ${req.status} ${req.error ? '(' + req.error + ')' : ''}`)
      })
    } else {
      console.log('⚠️  No auth API requests detected - this suggests the form submission is failing client-side')
    }
    
    if (failedRequests.length > 0) {
      console.log('\nFailed Requests:')
      failedRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url} → ${req.status} ${req.error ? '(' + req.error + ')' : ''}`)
      })
    }
    
    // 5. Check for client-side errors
    console.log('\n5. Console Messages:')
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    const warnings = consoleMessages.filter(msg => msg.type === 'warning')
    
    console.log(`Errors: ${errors.length}`)
    console.log(`Warnings: ${warnings.length}`)
    
    if (errors.length > 0) {
      console.log('\nConsole Errors:')
      errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.message}`)
      })
    }
    
    // 6. Check current page state
    console.log('\n6. Page State Analysis:')
    const pageState = {
      currentUrl: page.url(),
      hasErrorMessages: await page.locator('.bg-red-50, .text-red-800, [role="alert"]').count() > 0,
      formStillVisible: await page.locator('button[type="submit"]').count() > 0,
      loadingIndicator: await page.locator('text=Creating account..., text=Submitting').count() > 0
    }
    
    console.log('Page State:', JSON.stringify(pageState, null, 2))
    
    if (pageState.hasErrorMessages) {
      const errorMessages = await page.locator('.bg-red-50, .text-red-800').allTextContents()
      console.log('Error Messages on Page:', errorMessages)
    }
    
    // 7. Test direct API endpoint access
    console.log('\n7. Direct API Testing:')
    
    const apiTest = await page.evaluate(async (testData) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: testData.name + '-direct',
            email: testData.email.replace('@', '-direct@'),
            password: testData.password,
            familyName: testData.familyName
          })
        })
        
        const responseText = await response.text()
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }
        
        return {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, testData)
    
    console.log('Direct API Test Result:', JSON.stringify(apiTest, null, 2))
    
    // 8. Generate summary and recommendations
    console.log('\n=== DIAGNOSIS SUMMARY ===')
    
    const issues = []
    const recommendations = []
    
    if (authRequests.length === 0) {
      issues.push('No auth API requests detected')
      recommendations.push('Check client-side form submission logic and JavaScript errors')
    }
    
    if (errors.length > 0) {
      issues.push(`${errors.length} JavaScript errors detected`)
      recommendations.push('Fix JavaScript errors that may be preventing form submission')
    }
    
    if (apiTest.error === 'Failed to fetch' || (apiTest.status && apiTest.status === 0)) {
      issues.push('API endpoints are not accessible')
      recommendations.push('Check CORS configuration and API route deployment')
    }
    
    if (apiTest.status === 500) {
      issues.push('Server-side error in API')
      recommendations.push('Check server logs and environment variables in production')
    }
    
    if (!envCheck.hasConfigInScripts && !envCheck.windowSupabase) {
      issues.push('Supabase configuration not found in client-side code')
      recommendations.push('Verify NEXT_PUBLIC_SUPABASE_* environment variables are set in production')
    }
    
    console.log('\nIdentified Issues:')
    issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`))
    
    console.log('\nRecommendations:')
    recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`))
    
    // Take a screenshot for visual confirmation
    await page.screenshot({ path: 'auth-diagnostic-final.png', fullPage: true })
    console.log('\nScreenshot saved: auth-diagnostic-final.png')
  })
  
  test('should test login page specifically', async ({ page }) => {
    console.log('=== LOGIN PAGE DIAGNOSIS ===\n')
    
    const networkRequests: Array<{url: string, method: string, status: number, error?: string}> = []
    
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status()
      })
    })
    
    page.on('requestfailed', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        status: 0,
        error: request.failure()?.errorText || 'Unknown error'
      })
    })
    
    console.log('1. Loading login page...')
    await page.goto('https://simple-todo-app-bmad.vercel.app/auth/login', { waitUntil: 'networkidle' })
    
    console.log('2. Testing with valid format credentials...')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'TestPassword123')
    await page.click('button[type="submit"]')
    
    await page.waitForTimeout(3000)
    
    const authRequests = networkRequests.filter(req => req.url.includes('/api/auth/'))
    console.log(`\nAuth requests detected: ${authRequests.length}`)
    
    if (authRequests.length > 0) {
      console.log('Login API Requests:')
      authRequests.forEach((req, i) => {
        console.log(`  ${i + 1}. ${req.method} ${req.url} → ${req.status} ${req.error ? '(' + req.error + ')' : ''}`)
      })
    }
    
    const errorCount = await page.locator('.bg-red-50, .text-red-800').count()
    if (errorCount > 0) {
      const errorTexts = await page.locator('.bg-red-50, .text-red-800').allTextContents()
      console.log('Error messages displayed:', errorTexts)
    }
    
    console.log('Current URL after login attempt:', page.url())
  })
})