import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your SALVUS account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0d9488;">Welcome to SALVUS</h1>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">Verify Email</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #666;">${verificationUrl}</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent to ' + email)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Could not send verification email')
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your SALVUS account password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to create a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">Reset Password</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #666;">${resetUrl}</p>
        <p style="margin-top: 24px; font-size: 12px; color: #666;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent to ' + email)
  } catch (error) {
    console.error('Error sending password reset email:', error)
  }
}

export const sendActivationEmail = async (email: string, token: string) => {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate your SALVUS Relief Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0d9488;">Welcome to SALVUS</h1>
        <p>Your relief account has been created.</p>
        <p>Click the button below to set your password and access your account.</p>
        <a href="${activationUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">Set Password & Login</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #666;">${activationUrl}</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Activation email sent to ' + email)
  } catch (error) {
    console.error('Error sending activation email:', error)
    // Don't throw here to avoid failing the transaction if email fails, 
    // but maybe we should? For now, log it.
  }
}

export const sendVendorActivationEmail = async (email: string, token: string) => {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate Your SALVUS Vendor Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0d9488;">Welcome to SALVUS</h1>
        <p>Your vendor account has been reviewed and approved by the admin team.</p>
        <p>You can now access your vendor dashboard to list products/services and accept verified relief payments from beneficiaries.</p>
        <p>Click the button below to set your password and activate your account.</p>
        <a href="${activationUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">Set Password & Login</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${activationUrl}</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Vendor activation email sent to ' + email)
  } catch (error) {
    console.error('Error sending vendor activation email:', error)
  }
}

export const sendVendorAccessRestoredEmail = async (email: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Vendor Access Restored',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Access Restored</h2>
        <p>Your vendor access has been restored. You can now log in and continue using your vendor dashboard.</p>
        <p>No further action is required.</p>
        <p style="margin-top: 24px; color: #666;">— Team Salvus</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Vendor access restored email sent to ' + email)
  } catch (error) {
    console.error('Error sending vendor access restored email:', error)
  }
}
export const sendAdminInviteEmail = async (email: string, token: string) => {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${token}`
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Admin Invite – Activate Your SALVUS Admin Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488; margin-bottom: 8px;">Admin Invite</h2>
        <p style="margin: 0 0 12px;">You have been invited to join SALVUS as an organization administrator.</p>
        <p style="margin: 0 0 16px;">Click the button below to complete signup and activate your admin access.</p>
        <a href="${inviteUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 8px; font-weight: bold;">Accept Invite</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${inviteUrl}</p>
      </div>
    `,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log('Admin invite email sent to ' + email)
  } catch (error) {
    console.error('Error sending admin invite email:', error)
    throw new Error('Could not send admin invite email')
  }
}

export const sendSuspensionEmail = async (email: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Beneficiary Access Suspended',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Access Temporarily Suspended</h2>
        <p>Your beneficiary access is temporarily on hold due to an administrative review.</p>
        <p>Your account remains safe and unchanged. You’ll be notified once access is restored.</p>
        <p style="margin-top: 24px; color: #666;">— Team Salvus</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Suspension email sent to ' + email)
  } catch (error) {
    console.error('Error sending suspension email:', error)
  }
}

export const sendAccessRestoredEmail = async (email: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Beneficiary Access Restored',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Access Restored</h2>
        <p>Your beneficiary access has been restored. You can now log in and continue using beneficiary services.</p>
        <p>No further action is required.</p>
        <p style="margin-top: 24px; color: #666;">— Team Salvus</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Access restored email sent to ' + email)
  } catch (error) {
    console.error('Error sending access restored email:', error)
  }
}
