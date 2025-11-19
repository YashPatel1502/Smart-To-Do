-- Disable RLS on Account table because NextAuth/Prisma access via service role
ALTER TABLE "Account" DISABLE ROW LEVEL SECURITY;
