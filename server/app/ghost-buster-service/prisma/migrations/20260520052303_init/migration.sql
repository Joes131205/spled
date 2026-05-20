-- CreateTable
CREATE TABLE `GhostBusterFlag` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `level` ENUM('ACTIVE', 'WARNING', 'FLAGGED') NOT NULL DEFAULT 'ACTIVE',
    `lastActivityAt` DATETIME(3) NULL,
    `noUpdateDays` INTEGER NOT NULL DEFAULT 0,
    `flaggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GhostBusterFlag_projectId_idx`(`projectId`),
    INDEX `GhostBusterFlag_memberId_idx`(`memberId`),
    UNIQUE INDEX `GhostBusterFlag_projectId_memberId_key`(`projectId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
