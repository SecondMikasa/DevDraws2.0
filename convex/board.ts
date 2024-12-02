import { v } from "convex/values";
import { mutation } from "./_generated/server";

const images = [
    "/placeholders/1.svg",
    "/placeholders/2.svg",
    "/placeholders/3.svg",
    "/placeholders/4.svg",
    "/placeholders/5.svg",
    "/placeholders/6.svg",
    "/placeholders/7.svg",
    "/placeholders/8.svg",
    "/placeholders/9.svg",
    "/placeholders/10.svg",
]

export const Create = mutation({
    args: {
        orgId: v.string(),
        title: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized access")
        }

        const randomImg = images[Math.floor(Math.random() * images.length)]

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImg
        })

        return board;
    }
})

// Delete keyword is reserved in JS
export const Remove = mutation({
    args: {
        id: v.id("boards")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized access")
        }

        //TODO: Later check to delete favourite relation as well

        const userId = identity.subject

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", args.id)
            )
            .unique()
        
        if (existingFavourite) {
            await ctx.db.delete(existingFavourite._id)
        }

        await ctx.db.delete(args.id)
    }
})

export const Update = mutation({
    args: {
        id: v.id("boards"),
        title: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized access")
        }

        const title = args.title.trim()
        if (!title) {
            throw new Error("Title is required")
        }
        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters")
        }

        const board = await ctx.db.patch(args.id, {
            title: args.title,
        })
        return board
    }
})

export const Favourite = mutation({
    args: {
        id: v.id("boards"),
        orgId: v.string()
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized access")
        }

        const board = await ctx.db.get(args.id)

        if (!board) {
            throw new Error("Board not found")
        }

        const userId = identity.subject

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
            )
            .unique()

        if (existingFavourite) {
            throw new Error("Board already favourited")
        }

        await ctx.db.insert("userFavourites", {
            userId,
            boardId: board._id,
            orgId: args.orgId
        })

        return board
    }
})

export const Unfavourite = mutation({
    args: {
        id: v.id("boards"),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new Error("Unauthorized access")
        }

        const board = await ctx.db.get(args.id)

        if (!board) {
            throw new Error("Board not found")
        }

        const userId = identity.subject

        const existingFavourite = await ctx.db
            .query("userFavourites")
            .withIndex("by_user_board", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
                //      .eq("orgId", board.orgId)
                // TODO: Check if orgId is needed or not
            )
            .unique()

        if (!existingFavourite) {
            throw new Error("Favourited Board")
        }

        await ctx.db.delete(existingFavourite._id)

        return board
    }
})