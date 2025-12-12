import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, fullName } = body;

    if (action === 'register') {
      // Check if user exists
      const existingUser = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = await insert(`
        INSERT INTO users (email, password, full_name)
        VALUES (?, ?, ?)
      `, [email, hashedPassword, fullName]);

      const user = await queryOne('SELECT id, email, full_name, subscription_status FROM users WHERE id = ?', [userId]);

      return NextResponse.json({
        success: true,
        user
      });
    }

    if (action === 'login') {
      // Find user
      const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]) as any;

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        user: userWithoutPassword
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
