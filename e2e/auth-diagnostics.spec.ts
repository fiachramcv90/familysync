import { test, expect, Page } from '@playwright/test'

interface NetworkRequest {
  url: string
  method: string
  status: number
  statusText: string
  headers: Record<string, string>
  body?: any
}

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info'
  text: string
  timestamp: Date
}

class AuthenticationDiagnostics {
  private page: Page
  private networkRequests: NetworkRequest[] = []
  private consoleMessages: ConsoleMessage[] = []
  private errors: string[] = []

  constructor(page: Page) {
    this.page = page
    this.setupNetworkInterception()
    this.setupConsoleLogging()
  }

  private setupNetworkInterception() {
    this.page.on('response', async (response) => {
      const request = response.request()
      const networkRequest: NetworkRequest = {
        url: request.url(),
        method: request.method(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers()
      }

      // Capture request body for API calls
      if (request.url().includes('/api/') && ['POST', 'PUT', 'PATCH'].includes(request.method())) {
        try {
          const postData = request.postData()
          if (postData) {
            networkRequest.body = JSON.parse(postData)
          }
        } catch (e) {
          // Non-JSON body, ignore
        }
      }

      this.networkRequests.push(networkRequest)
    })

    this.page.on('requestfailed', (request) => {
      this.errors.push(`Request failed: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })
  }

  private setupConsoleLogging() {
    this.page.on('console', (message) => {
      this.consoleMessages.push({
        type: message.type() as any,
        text: message.text(),
        timestamp: new Date()
      })
    })

    this.page.on('pageerror', (error) => {
      this.errors.push(`Page error: ${error.message}`)
    })
  }

  async checkEnvironmentVariables() {
    const envVars = await this.page.evaluate(() => {
      // Check window object and __NEXT_DATA__ for environment variables
      const nextData = (window as any).__NEXT_DATA__
      return {
        NEXT_PUBLIC_SUPABASE_URL: (window as any).NEXT_PUBLIC_SUPABASE_URL || 'not found in window',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'not found in window',
        nextDataBuildId: nextData?.buildId || 'not found',
        windowKeys: Object.keys(window).filter(key => key.includes('SUPABASE') || key.includes('NEXT_PUBLIC'))
      }
    })

    return envVars
  }

  async testSupabaseConnection() {
    try {
      const result = await this.page.evaluate(async () => {
        try {
          // Try to import and test Supabase connection
          const { createClient } = await import('/src/lib/supabase')
          const supabase = createClient()
          
          // Test a simple query
          const { data, error } = await supabase.from('families').select('count').limit(1)
          
          return {
            success: !error,
            error: error?.message,
            data: data
          }
        } catch (e: any) {
          return {
            success: false,
            error: e.message
          }
        }
      })
      
      return result
    } catch (e: any) {
      return {
        success: false,
        error: e.message
      }
    }
  }

  getNetworkRequests() {
    return this.networkRequests
  }

  getConsoleMessages() {
    return this.consoleMessages
  }

  getErrors() {
    return this.errors
  }

  generateReport() {
    const authRequests = this.networkRequests.filter(req => req.url.includes('/api/auth/'))
    const failedRequests = this.networkRequests.filter(req => req.status >= 400)
    const consoleErrors = this.consoleMessages.filter(msg => msg.type === 'error')
    
    return {
      summary: {
        totalRequests: this.networkRequests.length,
        authRequests: authRequests.length,
        failedRequests: failedRequests.length,
        consoleErrors: consoleErrors.length,
        pageErrors: this.errors.length
      },
      authRequests,
      failedRequests,
      consoleErrors,
      pageErrors: this.errors,
      allNetworkRequests: this.networkRequests,
      allConsoleMessages: this.consoleMessages
    }
  }
}

test.describe('Authentication Diagnostics', () => {
  let diagnostics: AuthenticationDiagnostics

  test.beforeEach(async ({ page }) => {
    diagnostics = new AuthenticationDiagnostics(page)
  })

  test('should diagnose registration page issues', async ({ page }) => {
    console.log('=== STARTING REGISTRATION DIAGNOSTICS ===')
    
    // Navigate to registration page
    await page.goto('https://simple-todo-app-bmad.vercel.app/auth/register')
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Check if page loaded correctly
    await expect(page).toHaveTitle(/FamilySync|Create|Register/)
    
    // Check for environment variables
    const envVars = await diagnostics.checkEnvironmentVariables()
    console.log('Environment Variables:', JSON.stringify(envVars, null, 2))
    
    // Test Supabase connection
    const supabaseTest = await diagnostics.testSupabaseConnection()
    console.log('Supabase Connection Test:', JSON.stringify(supabaseTest, null, 2))
    
    // Check if form elements exist
    const formElements = {
      nameInput: await page.locator('input[name="name"]').count() > 0,
      emailInput: await page.locator('input[name="email"]').count() > 0,
      passwordInput: await page.locator('input[name="password"]').count() > 0,
      confirmPasswordInput: await page.locator('input[name="confirmPassword"]').count() > 0,
      familyNameInput: await page.locator('input[name="familyName"]').count() > 0,
      submitButton: await page.locator('button[type="submit"]').count() > 0
    }
    
    console.log('Form Elements Present:', JSON.stringify(formElements, null, 2))
    
    // Fill out the form with test data
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123'
    const testName = 'Test User'
    const testFamilyName = 'Test Family'
    
    console.log('Filling registration form with test data...')
    
    await page.fill('input[name="name"]', testName)
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="familyName"]', testFamilyName)
    await page.fill('input[name="password"]', testPassword)
    await page.fill('input[name="confirmPassword"]', testPassword)
    
    // Submit the form
    console.log('Submitting registration form...')
    await page.click('button[type="submit"]')
    
    // Wait for response
    await page.waitForTimeout(5000)
    
    // Generate diagnostic report
    const report = diagnostics.generateReport()
    console.log('=== REGISTRATION DIAGNOSTIC REPORT ===')
    console.log('Summary:', JSON.stringify(report.summary, null, 2))
    
    console.log('\n=== AUTH API REQUESTS ===')
    report.authRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`)
      console.log(`   Status: ${req.status} ${req.statusText}`)
      if (req.body) {
        console.log(`   Request Body:`, JSON.stringify(req.body, null, 2))
      }
      console.log(`   Headers:`, JSON.stringify(req.headers, null, 2))
      console.log('')
    })
    
    console.log('\n=== FAILED REQUESTS ===')
    report.failedRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`)
      console.log(`   Status: ${req.status} ${req.statusText}`)
      console.log(`   Headers:`, JSON.stringify(req.headers, null, 2))
      console.log('')
    })
    
    console.log('\n=== CONSOLE ERRORS ===')
    report.consoleErrors.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.timestamp.toISOString()}] ${msg.text}`)
    })
    
    console.log('\n=== PAGE ERRORS ===')
    report.pageErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
    
    // Check for success or failure indicators
    const successIndicators = {
      redirectedToDashboard: page.url().includes('/dashboard'),
      successMessage: await page.locator('text=successful').count() > 0,
      errorMessage: await page.locator('[role="alert"], .bg-red-50, .text-red-800').count() > 0
    }
    
    console.log('\n=== SUCCESS/FAILURE INDICATORS ===')
    console.log(JSON.stringify(successIndicators, null, 2))
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'registration-diagnostic-result.png', fullPage: true })
    console.log('Screenshot saved: registration-diagnostic-result.png')
  })

  test('should diagnose login page issues', async ({ page }) => {
    console.log('=== STARTING LOGIN DIAGNOSTICS ===')
    
    // Navigate to login page
    await page.goto('https://simple-todo-app-bmad.vercel.app/auth/login')
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Check if page loaded correctly
    await expect(page).toHaveTitle(/FamilySync|Sign|Login/)
    
    // Check if form elements exist
    const formElements = {
      emailInput: await page.locator('input[name="email"]').count() > 0,
      passwordInput: await page.locator('input[name="password"]').count() > 0,
      submitButton: await page.locator('button[type="submit"]').count() > 0,
      registerLink: await page.locator('a[href*="register"]').count() > 0
    }
    
    console.log('Login Form Elements Present:', JSON.stringify(formElements, null, 2))
    
    // Test with invalid credentials first
    console.log('Testing with invalid credentials...')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'InvalidPassword123')
    await page.click('button[type="submit"]')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check for error handling
    const errorHandling = {
      errorDisplayed: await page.locator('[role="alert"], .bg-red-50, .text-red-800').count() > 0,
      errorText: await page.locator('[role="alert"], .bg-red-50, .text-red-800').first().textContent()
    }
    
    console.log('Error Handling for Invalid Credentials:', JSON.stringify(errorHandling, null, 2))
    
    // Clear form and test with valid-format but non-existent credentials
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'ValidPassword123')
    await page.click('button[type="submit"]')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Generate diagnostic report
    const report = diagnostics.generateReport()
    console.log('=== LOGIN DIAGNOSTIC REPORT ===')
    console.log('Summary:', JSON.stringify(report.summary, null, 2))
    
    console.log('\n=== AUTH API REQUESTS ===')
    report.authRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`)
      console.log(`   Status: ${req.status} ${req.statusText}`)
      if (req.body) {
        console.log(`   Request Body:`, JSON.stringify(req.body, null, 2))
      }
      console.log('')
    })
    
    console.log('\n=== FAILED REQUESTS ===')
    report.failedRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url}`)
      console.log(`   Status: ${req.status} ${req.statusText}`)
      console.log('')
    })
    
    console.log('\n=== CONSOLE ERRORS ===')
    report.consoleErrors.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.timestamp.toISOString()}] ${msg.text}`)
    })
    
    console.log('\n=== PAGE ERRORS ===')
    report.pageErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`)
    })
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'login-diagnostic-result.png', fullPage: true })
    console.log('Screenshot saved: login-diagnostic-result.png')
  })

  test('should test API endpoints directly', async ({ page }) => {
    console.log('=== TESTING API ENDPOINTS DIRECTLY ===')
    
    const baseUrl = 'https://simple-todo-app-bmad.vercel.app'
    
    // Test registration endpoint
    const registerResponse = await page.evaluate(async (url) => {
      try {
        const response = await fetch(`${url}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: `api-test-${Date.now()}@example.com`,
            password: 'TestPassword123',
            name: 'API Test User',
            familyName: 'API Test Family'
          })
        })
        
        const data = await response.text()
        let parsedData
        try {
          parsedData = JSON.parse(data)
        } catch {
          parsedData = data
        }
        
        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: parsedData
        }
      } catch (error: any) {
        return {
          error: error.message
        }
      }
    }, baseUrl)
    
    console.log('Direct API Registration Test:', JSON.stringify(registerResponse, null, 2))
    
    // Test login endpoint
    const loginResponse = await page.evaluate(async (url) => {
      try {
        const response = await fetch(`${url}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'TestPassword123'
          })
        })
        
        const data = await response.text()
        let parsedData
        try {
          parsedData = JSON.parse(data)
        } catch {
          parsedData = data
        }
        
        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: parsedData
        }
      } catch (error: any) {
        return {
          error: error.message
        }
      }
    }, baseUrl)
    
    console.log('Direct API Login Test:', JSON.stringify(loginResponse, null, 2))
    
    // Test if we can access the API routes at all
    const healthCheck = await page.evaluate(async (url) => {
      const endpoints = ['/api/auth/register', '/api/auth/login', '/api/auth/profile']
      const results = []
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${url}${endpoint}`, {
            method: 'GET'
          })
          results.push({
            endpoint,
            accessible: true,
            status: response.status,
            statusText: response.statusText
          })
        } catch (error: any) {
          results.push({
            endpoint,
            accessible: false,
            error: error.message
          })
        }
      }
      
      return results
    }, baseUrl)
    
    console.log('API Endpoints Health Check:', JSON.stringify(healthCheck, null, 2))
  })

  test('should check application deployment and configuration', async ({ page }) => {
    console.log('=== CHECKING DEPLOYMENT CONFIGURATION ===')
    
    await page.goto('https://simple-todo-app-bmad.vercel.app')
    
    // Check basic page load
    const pageInfo = {
      title: await page.title(),
      url: page.url(),
      loaded: await page.locator('body').count() > 0
    }
    
    console.log('Page Info:', JSON.stringify(pageInfo, null, 2))
    
    // Check for build information
    const buildInfo = await page.evaluate(() => {
      const nextData = (window as any).__NEXT_DATA__
      return {
        buildId: nextData?.buildId || 'not found',
        runtimeConfig: nextData?.runtimeConfig,
        props: nextData?.props,
        hasNextData: !!nextData
      }
    })
    
    console.log('Build Info:', JSON.stringify(buildInfo, null, 2))
    
    // Check network resources loading
    await page.waitForLoadState('networkidle')
    
    const report = diagnostics.generateReport()
    const resourcesCheck = {
      jsFiles: report.allNetworkRequests.filter(req => req.url.endsWith('.js')),
      cssFiles: report.allNetworkRequests.filter(req => req.url.endsWith('.css')),
      failedResources: report.failedRequests.filter(req => 
        req.url.includes('.js') || req.url.includes('.css') || req.url.includes('_next')
      )
    }
    
    console.log('Resources Check:')
    console.log(`JS Files loaded: ${resourcesCheck.jsFiles.length}`)
    console.log(`CSS Files loaded: ${resourcesCheck.cssFiles.length}`)
    console.log(`Failed Resources: ${resourcesCheck.failedResources.length}`)
    
    if (resourcesCheck.failedResources.length > 0) {
      console.log('Failed Resources:', resourcesCheck.failedResources.map(r => `${r.url} (${r.status})`))
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'deployment-diagnostic.png', fullPage: true })
    console.log('Screenshot saved: deployment-diagnostic.png')
  })
})