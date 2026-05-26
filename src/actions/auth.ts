"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prismaClient } from "@/lib/prismaClient";

export async function onAuthenticateUser() {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403, message: "User not found" };
    }

    const userExists = await prismaClient.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (userExists) {
      return {
        status: 200,
        user: userExists,
      };
    }

    const newUser = await prismaClient.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName ?? user.username ?? "Unknown",
        profileImage: user.imageUrl,
      },
    });

    if (!newUser) {
      return {
        status: 500,
        message: "Failed to create user",
      };
    }

    return {
      status: 201,
      user: newUser,
    };
  } catch (error) {
    console.log("error:", error);
    // Write the error to a file so we can debug it

    return {
      status: 500,
      error: "internal server error",
    };
  }
}
