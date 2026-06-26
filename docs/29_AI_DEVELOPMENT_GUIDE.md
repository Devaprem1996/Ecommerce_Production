# 29_AI_DEVELOPMENT_GUIDE.md

# AI Development Guide

Version: 1.0

Status: Approved

Purpose: Standard Operating Procedure (SOP) for AI-Assisted Development

---

# 1. Purpose

This document defines how AI will be used throughout the project.

AI is an engineering assistant.

AI is NOT the decision maker.

The developer remains responsible for:

* Requirements
* Architecture
* Business Rules
* Final Approval
* Testing
* Deployment

---

# 2. AI Roles

During this project, AI performs multiple roles.

## Solution Architect

Responsibilities

* Design architecture
* Review architecture
* Recommend improvements

---

## Senior Backend Engineer

Responsibilities

* Explain backend concepts
* Generate backend code
* Review backend code
* Identify security issues

---

## Senior Frontend Engineer

Responsibilities

* Generate frontend code
* Review UI
* Improve component design

---

## DevOps Engineer

Responsibilities

* Environment setup
* Docker
* Deployment
* CI/CD
* Monitoring

---

## QA Engineer

Responsibilities

* Test planning
* Test cases
* Bug analysis
* Edge cases

---

## Technical Writer

Responsibilities

* Documentation
* API documentation
* Architecture documentation
* README updates

---

# 3. AI Rules

AI must always:

Explain

↓

Design

↓

Plan

↓

Generate

↓

Review

↓

Test

↓

Document

AI must never:

Skip architecture

Generate large modules without approval

Modify unrelated files

Assume project structure

Rename APIs without approval

Change database schema without updating documentation

---

# 4. Session Startup Checklist

Before every coding session:

Read:

* 00_PROJECT_RULES.md
* 01_PROJECT_PLAN.md
* Current architecture document
* Current feature specification
* PROJECT_STATUS.md
* DECISION_LOG.md

Review:

* Current task
* Previous commit
* Open bugs

Then begin work.

---

# 5. Standard AI Prompt Structure

Every prompt must contain:

Project

Current Phase

Current Feature

Current Task

Completed Work

Technology Stack

Rules

Expected Output

Example

Project

Production Ecommerce Platform

Current Phase

Authentication

Current Feature

Google OAuth

Current Task

Implement authentication middleware

Completed

Architecture

Database

API Design

Technology

Next.js

Node.js

Express

Prisma

PostgreSQL

Rules

Generate only one file.

Explain before coding.

Do not modify unrelated files.

Review your solution before finishing.

Expected Output

Objective

Files

Commands

Code

Testing

Review

---

# 6. AI Coding Workflow

Business Requirement

↓

Architecture

↓

Database

↓

API

↓

Implementation Plan

↓

Generate One File

↓

Explain Code

↓

Manual Review

↓

Testing

↓

Documentation

↓

Git Commit

Never skip a step.

---

# 7. One File Rule

AI generates only:

One file

or

One small feature

per request.

Example

Correct

Generate auth.middleware.ts

Incorrect

Generate the complete authentication system.

---

# 8. Code Review Prompt

After AI generates code, ask:

Review this implementation as a Senior Software Engineer.

Check for:

* Bugs
* Security issues
* Performance problems
* Readability
* Maintainability
* Production readiness

Return:

Critical

High

Medium

Low

Recommendations

Do not approve weak code.

---

# 9. Debugging Prompt

When an error occurs:

Provide:

Problem

Expected Result

Actual Result

Error Message

Log Output

Relevant Code

Environment

Then ask AI to:

Explain the root cause.

List possible fixes.

Recommend the safest fix.

Explain why.

Never ask:

Fix my code.

Always investigate first.

---

# 10. Learning Prompt

After every completed feature ask:

Teach me what we built.

Explain:

Architecture

Business Logic

Database

API

Security

Common mistakes

Production improvements

Use simple language.

---

# 11. Documentation Prompt

At the end of every feature ask:

Update:

PROJECT_STATUS.md

BUGS.md

DECISION_LOG.md

README.md

Feature Documentation

---

# 12. End-of-Day Prompt

Before stopping work ask:

Summarize today's work.

Include:

Completed Tasks

Files Created

Lessons Learned

Open Issues

Tomorrow's Tasks

Suggested Git Commit

Documentation Updates

---

# 13. AI Restrictions

AI must not:

Invent requirements

Remove security

Skip validation

Ignore error handling

Use deprecated libraries

Hardcode secrets

Commit credentials

Change architecture without approval

---

# 14. Definition of Done

A feature is complete only when:

✓ Code implemented

✓ Architecture followed

✓ Tests passed

✓ Code reviewed

✓ Documentation updated

✓ Git committed

✓ Status updated

✓ Lessons recorded

---

# 15. Daily Workflow

Start Day

↓

Read documentation

↓

Review today's task

↓

Ask AI to explain

↓

Review architecture

↓

Generate one file

↓

Test

↓

Review

↓

Document

↓

Commit

↓

Update project status

↓

Plan tomorrow

---

# 16. AI Prompt Library

## A. Explain Before Coding

Explain the objective, business rules, architecture impact, files involved, dependencies, and testing strategy. Do not generate code.

---

## B. Implementation Plan

Create a step-by-step implementation plan. Identify prerequisites, affected files, risks, and acceptance criteria.

---

## C. Generate One File

Generate only the requested file. Follow the approved architecture and coding standards. Do not modify unrelated files.

---

## D. Review Code

Review the implementation for correctness, security, maintainability, performance, and production readiness. Suggest improvements with priorities.

---

## E. Write Tests

Generate tests only for the approved implementation. Cover success cases, validation failures, authorization failures, and edge cases.

---

## F. Update Documentation

Update all relevant project documentation based on the completed feature without changing approved architecture.

---

# Final Rule

AI is a tool.

Architecture is the authority.

Documentation is the source of truth.

Business rules override implementation.

Never sacrifice correctness for speed.

END OF DOCUMENT
