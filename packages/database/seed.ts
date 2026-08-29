import { createHmac, randomBytes } from "node:crypto";
import { connectDB } from "./index";
import { UserModel } from "./models/user";
import { ProjectModel } from "./models/project";
import { TaskModel } from "./models/task";
import { CommentModel } from "./models/comment";
import { ActivityModel } from "./models/activity";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");
  return { salt, hash };
}

export async function seedDatabase() {
  console.log("🌱 Starting Database Seeding...");
  await connectDB();

  // Clear existing collections
  await UserModel.deleteMany({});
  await ProjectModel.deleteMany({});
  await TaskModel.deleteMany({});
  await CommentModel.deleteMany({});
  await ActivityModel.deleteMany({});

  console.log(" Cleared existing records.");

  // 1. Create Users
  const adminPass = hashPassword("Admin@123");
  const admin = await UserModel.create({
    fullName: "Alex Rivera (Admin)",
    email: "alex.admin@taskflow.dev",
    password: adminPass.hash,
    salt: adminPass.salt,
    role: "ADMIN",
    jobTitle: "Lead Engineering Manager",
    department: "Engineering",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  const member1Pass = hashPassword("Member@123");
  const member1 = await UserModel.create({
    fullName: "Sarah Chen (Full-Stack)",
    email: "sarah.chen@taskflow.dev",
    password: member1Pass.hash,
    salt: member1Pass.salt,
    role: "MEMBER",
    jobTitle: "Senior Frontend Engineer",
    department: "Engineering",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  });

  const member2Pass = hashPassword("Member@123");
  const member2 = await UserModel.create({
    fullName: "Marcus Vance (Backend)",
    email: "marcus.vance@taskflow.dev",
    password: member2Pass.hash,
    salt: member2Pass.salt,
    role: "MEMBER",
    jobTitle: "Cloud Architect",
    department: "Infrastructure",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  });

  const member3Pass = hashPassword("Member@123");
  const member3 = await UserModel.create({
    fullName: "Elena Rostova (UI/UX)",
    email: "elena.design@taskflow.dev",
    password: member3Pass.hash,
    salt: member3Pass.salt,
    role: "MEMBER",
    jobTitle: "Lead Product Designer",
    department: "Design",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  });

  console.log(` Created 4 users (1 Admin, 3 Members)`);

  // 2. Create Projects
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const project1 = await ProjectModel.create({
    name: "Cloud Platform 2.0 Modernization",
    description:
      "Architecting zero-downtime microservices and high-throughput tRPC APIs on cloud infrastructure.",
    color: "#6366f1",
    status: "ACTIVE",
    ownerId: admin._id,
    memberIds: [admin._id, member1._id, member2._id, member3._id],
    startDate: now,
    targetEndDate: nextMonth,
  });

  const project2 = await ProjectModel.create({
    name: "Design System & Mobile App Redesign",
    description:
      "Refreshing the mobile experience with accessible shadcn primitives, dark mode, and sleek micro-interactions.",
    color: "#ec4899",
    status: "ACTIVE",
    ownerId: admin._id,
    memberIds: [admin._id, member1._id, member3._id],
    startDate: now,
    targetEndDate: twoMonthsLater,
  });

  console.log(` Created 2 sample projects`);

  // 3. Create Tasks with Deadline Revision History
  const initialDeadline1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const extendedDeadline1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const task1 = await TaskModel.create({
    title: "Implement MongoDB Atlas Cluster Integration & Replica Set Auth",
    description:
      "Connect application to production MongoDB instance, configure connection pooling and model indexes.",
    projectId: project1._id,
    assigneeId: member2._id,
    creatorId: admin._id,
    priority: "HIGH",
    status: "IN_PROGRESS",
    deadline: extendedDeadline1,
    deadlineHistory: [
      {
        previousDeadline: initialDeadline1,
        newDeadline: extendedDeadline1,
        changedBy: admin._id,
        changedByName: admin.fullName,
        changedAt: new Date(now.getTime() - 2 * 3600 * 1000),
        reason: "Extended to allow additional security audits and load testing on replica sets.",
      },
    ],
    estimatedHours: 16,
    tags: ["Backend", "Database", "Security"],
  });

  const initialDeadline2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const task2 = await TaskModel.create({
    title: "Build Responsive Kanban Task Board with Role-based Controls",
    description:
      "Create Kanban drag-and-drop workflow with realtime status updates, quick filters, and priority tags.",
    projectId: project1._id,
    assigneeId: member1._id,
    creatorId: admin._id,
    priority: "URGENT",
    status: "IN_REVIEW",
    deadline: initialDeadline2,
    deadlineHistory: [],
    estimatedHours: 24,
    tags: ["Frontend", "UI/UX", "Next.js"],
  });

  const initialDeadline3 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const extendedDeadline3_1 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const extendedDeadline3_2 = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000);

  const task3 = await TaskModel.create({
    title: "Design System Tokenization & Dark Mode Aesthetic Polish",
    description:
      "Establish semantic colors, typography tokens, glassmorphism card styles and fluid animations.",
    projectId: project2._id,
    assigneeId: member3._id,
    creatorId: admin._id,
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    deadline: extendedDeadline3_2,
    deadlineHistory: [
      {
        previousDeadline: initialDeadline3,
        newDeadline: extendedDeadline3_1,
        changedBy: admin._id,
        changedByName: admin.fullName,
        changedAt: new Date(now.getTime() - 48 * 3600 * 1000),
        reason: "Scope expanded to include accessibility contrast checks.",
      },
      {
        previousDeadline: extendedDeadline3_1,
        newDeadline: extendedDeadline3_2,
        changedBy: admin._id,
        changedByName: admin.fullName,
        changedAt: new Date(now.getTime() - 12 * 3600 * 1000),
        reason: "Added high-DPI export assets and component playground.",
      },
    ],
    estimatedHours: 32,
    tags: ["Design", "Figma", "CSS"],
  });

  const task4 = await TaskModel.create({
    title: "Setup API Rate Limiting & OpenAPI Documentation",
    description:
      "Configure OpenAPI JSON generation, Scalar documentation viewer, and request validation middleware.",
    projectId: project1._id,
    assigneeId: member2._id,
    creatorId: admin._id,
    priority: "LOW",
    status: "COMPLETED",
    deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    deadlineHistory: [],
    estimatedHours: 8,
    tags: ["API", "tRPC", "Documentation"],
  });

  const task5 = await TaskModel.create({
    title: "Implement Task Deadline Revision Timeline Component",
    description:
      "Deliver a dedicated visual component showing all historical deadline adjustments, changelog reasons, and authors.",
    projectId: project1._id,
    assigneeId: member1._id,
    creatorId: admin._id,
    priority: "URGENT",
    status: "TODO",
    deadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    deadlineHistory: [],
    estimatedHours: 12,
    tags: ["Feature", "Challenge", "Frontend"],
  });

  console.log(` Created 5 rich tasks with deadline history records`);

  // 4. Create Sample Comments & Progress Updates
  await CommentModel.create([
    {
      taskId: task1._id,
      authorId: member2._id,
      content:
        "Replica set connection strings tested successfully with SSL enabled. Ready for query profiling!",
    },
    {
      taskId: task1._id,
      authorId: admin._id,
      content:
        "Great progress Marcus. I've updated the deadline to give you breathing room for index optimization.",
    },
    {
      taskId: task2._id,
      authorId: member1._id,
      content: "Kanban columns with optimistic updates completed. Moving to PR review now.",
    },
  ]);

  console.log(` Created sample comments`);

  // 5. Create Activity Logs
  await ActivityModel.create([
    {
      taskId: task1._id,
      projectId: project1._id,
      userId: admin._id,
      userName: admin.fullName,
      type: "DEADLINE_CHANGED",
      details: `Deadline updated from ${initialDeadline1.toLocaleDateString()} to ${extendedDeadline1.toLocaleDateString()}`,
      metadata: { previousDeadline: initialDeadline1, newDeadline: extendedDeadline1 },
    },
    {
      taskId: task2._id,
      projectId: project1._id,
      userId: member1._id,
      userName: member1.fullName,
      type: "STATUS_CHANGED",
      details: "Task status moved from IN_PROGRESS to IN_REVIEW",
      metadata: { from: "IN_PROGRESS", to: "IN_REVIEW" },
    },
  ]);

  console.log(" Seed completed successfully!");
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
