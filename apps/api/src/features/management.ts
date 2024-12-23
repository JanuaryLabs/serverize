import { firebaseApp } from '@extensions/firebase-auth';
import {
	createQueryBuilder,
	deferredJoinPagination,
	execute,
	Pagination,
	patchEntity,
	saveEntity,
} from '@extensions/postgresql';
import {
	Claims,
	createDefaultOrg,
	setUserClaims,
	tellDiscord,
} from '@extensions/user';
import { orgNameValidator } from '@extensions/zod';
import {
	feature,
	field,
	index,
	mandatory,
	policy,
	table,
	trigger,
	unique,
	useTable,
	workflow,
} from '@january/declarative';
import { Octokit } from '@octokit/core';
import { tables } from '@workspace/entities';
import { verifyToken } from '@workspace/identity';
import {
	AuthClientErrorCode,
	FirebaseAuthError,
	getAuth,
} from 'firebase-admin/auth';
import { ProblemDetailsException } from 'rfc-7807-problem-details';
import z from 'zod';

export default feature({
	policies: {
		authenticated: policy.http(async (context) => {
			await verifyToken(context.req.header('Authorization'));
			return true;
		}),
		adminOnly: policy.http(async (context) => {
			if (!context.var.subject) {
				return false;
			}
			return context.var.subject.claims.admin;
		}),
		notImplemented: policy.http(() => {
			throw new ProblemDetailsException({
				title: 'Not implemented',
				detail: 'This feature is not implemented yet',
				status: 501,
			});
		}),
	},
	workflows: [
		// #region Organizations
		workflow('ListOrganizations', {
			tag: 'organizations',
			trigger: trigger.http({
				path: '/',
				method: 'get',
				policies: ['authenticated', 'adminOnly'],
				input: (trigger) => ({
					pageSize: {
						select: trigger.query.pageSize,
						against: z.coerce
							.number()
							.int()
							.min(1)
							.max(50)
							.default(50)
							.optional(),
					},
					pageNo: {
						select: trigger.query.pageNo,
						against: z.coerce.number().int().min(1).optional(),
					},
				}),
			}),
			execute: async ({ input, output }) => {
				const qb = createQueryBuilder(tables.organizations, 'organizations');
				const paginationMetadata = deferredJoinPagination(qb, {
					pageSize: input.pageSize,
					pageNo: input.pageNo,
					count: await qb.getCount(),
				});
				const records = await execute(qb);
				return output.ok({
					records,
					meta: paginationMetadata(records),
				});
			},
		}),
		workflow('CreateDefaultOrganization', {
			tag: 'organizations',
			trigger: trigger.http({
				path: '/default',
				method: 'post',
				input: (trigger) => ({
					name: {
						select: trigger.body.name,
						against: orgNameValidator,
					},
					projectName: {
						select: trigger.body.projectName,
						against: orgNameValidator,
					},
					uid: {
						select: trigger.body.uid,
						against: z.string().trim().min(1),
					},
				}),
			}),
			execute: async ({ input, output }) => {
				try {
					const data = await createDefaultOrg({
						uid: input.uid,
						name: input.name,
						projectName: input.projectName,
					});

					const firebaseUser = await getAuth(firebaseApp)
						.getUser(input.uid)
						.catch((error) => {
							if (process.env.NODE_ENV === 'development') {
								console.error(error);
							}
							// noop
						});
					if (firebaseUser) {
						await tellDiscord(`New user "${firebaseUser.email}" join.`).catch(
							(error) => {
								if (process.env.NODE_ENV === 'development') {
									console.error(error);
								}
								// noop
							}
						);
					}

					const claims = await setUserClaims({
						uid: input.uid,
						organizationId: data.organizationId,
						workspaceId: data.workspaceId,
						projectId: data.projectId,
					});

					return output.ok(claims);
				} catch (error) {
					if (error instanceof ProblemDetailsException) {
						if (error.Details.detail === 'SQLITE_CONSTRAINT_UNIQUE') {
							error.Details.title = 'Organization already exists';
							error.Details.detail = `Organization with name '${input.name}' already exists`;
							throw error;
						}
					}
					throw error;
				}
			},
		}),
		workflow('CreateOrganization', {
			tag: 'organizations',
			trigger: trigger.http({
				path: '/',
				method: 'post',
				input: (trigger) => ({
					name: {
						select: trigger.body.name,
						against: z.string().trim().min(1),
					},
				}),
			}),
			execute: async ({ input }) => {
				await saveEntity(tables.organizations, {
					name: input.name,
				});
			},
		}),
		workflow('CreateWorkspace', {
			tag: 'workspaces',
			trigger: trigger.http({
				path: '/',
				method: 'post',
				input: (trigger) => ({
					name: {
						select: trigger.body.name,
						against: z.string().trim().min(1),
					},
					organizationId: {
						select: trigger.body.organizationId,
						against: z.string().uuid(),
					},
				}),
			}),
			execute: async ({ input }) => {
				await saveEntity(tables.workspaces, {
					name: input.name,
					organizationId: input.organizationId,
				});
			},
		}),
		// #endregion
		// #region Project
		workflow('CreateProject', {
			tag: 'projects',
			trigger: trigger.http({
				path: '/',
				method: 'post',
				policies: ['authenticated'],
				input: (trigger) => ({
					name: {
						select: trigger.body.name,
						against: orgNameValidator,
					},
				}),
			}),
			execute: async ({ input, subject }) => {
				// FIXME: workspaceId should come from the body
				// user should select in what workspace the project should be created
				// there's no use of it in the claims.
				// IMPORTANT: at the moment project can be created without workspaceId (floating project) must be fixed
				await saveEntity(tables.projects, {
					name: input.name,
					workspaceId: subject.claims.workspaceId,
				});
			},
		}),
		workflow('PatchProject', {
			tag: 'projects',
			trigger: trigger.http({
				path: '/:id',
				method: 'patch',
				policies: ['notImplemented'],
				input: (trigger) => ({
					id: {
						select: trigger.path.id,
						against: z.string().uuid(),
					},
					name: {
						select: trigger.body.name,
						against: z.string().trim().min(1),
					},
				}),
			}),
			execute: async ({ input }) => {
				const qb = createQueryBuilder(tables.projects, 'projects').where(
					'projects.id = :id',
					{ id: input.id }
				);
				await patchEntity(qb, {
					name: input.name,
				});
			},
		}),
		workflow('ListProjects', {
			tag: 'projects',
			trigger: trigger.http({
				path: '/',
				method: 'get',
				policies: ['authenticated'],
				input: (trigger) => ({
					workspaceId: {
						select: trigger.query.workspaceId,
						against: z.string().uuid().optional(),
					},
					name: {
						select: trigger.query.name,
						against: z.string().trim().min(1).optional(),
					},
					pageSize: {
						select: trigger.query.pageSize,
						against: z.coerce
							.number()
							.int()
							.min(1)
							.max(50)
							.default(50)
							.optional(),
					},
					pageNo: {
						select: trigger.query.pageNo,
						against: z.coerce.number().int().min(1).optional(),
					},
				}),
			}),
			execute: async ({ input, subject, output }) => {
				const qb = createQueryBuilder(tables.projects, 'projects').where(
					'projects.workspaceId = :workspaceId',
					{ workspaceId: subject.claims.workspaceId }
				);
				for (const prop of ['workspaceId', 'name'] as const) {
					if (input[prop]) {
						qb.andWhere(`projects.${prop} = :${prop}`, {
							[prop]: input[prop],
						});
					}
				}
				const paginationMetadata = deferredJoinPagination(qb, {
					pageSize: input.pageSize,
					pageNo: input.pageNo,
					count: await qb.getCount(),
				});
				const records = await execute(qb);
				return output.ok({
					records,
					meta: paginationMetadata(records),
				});
			},
		}),
		workflow('ListUserOrganizations', {
			tag: 'users',
			trigger: trigger.http({
				policies: ['authenticated'],
				path: 'organizations',
				method: 'get',
			}),
			execute: async ({ subject, output }) => {
				const qb = createQueryBuilder(tables.organizations, 'organizations')
					.innerJoin('organizations.members', 'members')
					.where('members.userId = :userId', { userId: subject.claims.uid });
				const records = await execute(qb);
				const paginationMetadata = deferredJoinPagination(qb, {
					pageSize: 50,
					pageNo: 1,
					count: await qb.getCount(),
				});
				// This endpoint should return projects as well
				return output.ok({
					records,
					meta: paginationMetadata(records),
				});
			},
		}),
		workflow('LinkUser', {
			tag: 'users',
			trigger: trigger.http({
				policies: [],
				method: 'post',
				path: '/link',
				input: (trigger) => ({
					token: {
						select: trigger.body.token,
						against: z.string(),
					},
					providerId: {
						select: trigger.body.providerId,
						against: z.enum(['github.com', 'google.com', 'password']),
					},
					orgName: {
						select: trigger.body.orgName,
						against: orgNameValidator,
					},
					projectName: {
						select: trigger.body.projectName,
						against: orgNameValidator,
					},
				}),
			}),
			execute: async ({ input, output }) => {
				const auth = getAuth(firebaseApp);
				const octokit = new Octokit({
					auth: input.token,
				});
				const { data: user } = await octokit.request('GET /user');
				const uid = String(user.id);

				try {
					await auth.getUser(uid);
					throw new ProblemDetailsException({
						title: 'User already exists',
						detail: `User with id '${uid}' already exists`,
						status: 409,
					});
				} catch (error) {
					if (error instanceof FirebaseAuthError) {
						if (error.hasCode(AuthClientErrorCode.USER_NOT_FOUND.code)) {
							const newUser = await auth.createUser({
								uid: uid,
								disabled: false,
								displayName: user.name || undefined,
								email: user.email || undefined,
								emailVerified: true,
								photoURL: user.avatar_url || undefined,
							});
							await auth.updateUser(newUser.uid, {
								providerToLink: {
									uid: uid,
									providerId: 'github.com',
									displayName: user.name || undefined,
									email: user.email || undefined,
									photoURL: user.avatar_url || undefined,
								},
							});
							try {
								const data = await createDefaultOrg({
									uid: uid,
									name: input.orgName,
									projectName: input.projectName,
								});
								return output.created({
									accessToken: await auth.createCustomToken(uid, {
										source: 'vscode',
										...({
											organizationId: data.organizationId,
											workspaceId: data.workspaceId,
											projectId: data.projectId,
											aknowledged: true,
										} satisfies Claims),
									}),
								});
							} catch (error) {
								await auth.deleteUser(uid);
								throw error;
							}
						}
					}
					throw error;
				}
			},
		}),
		workflow('Signin', {
			tag: 'users',
			trigger: trigger.http({
				method: 'post',
				path: '/signin',
				input: (trigger) => ({
					token: {
						select: trigger.body.token,
						against: z.string(),
					},
					providerId: {
						select: trigger.body.providerId,
						against: z.enum(['github.com', 'google.com', 'password']),
					},
				}),
			}),
			execute: async ({ input, output }) => {
				const auth = getAuth(firebaseApp);
				const octokit = new Octokit({
					auth: input.token,
				});
				const { data: user } = await octokit.request('GET /user');
				const uid = String(user.id);
				try {
					await auth.getUser(uid);
				} catch (error) {
					if (error instanceof FirebaseAuthError) {
						if (error.hasCode(AuthClientErrorCode.USER_NOT_FOUND.code)) {
							throw new ProblemDetailsException({
								title: 'User not found',
								detail: `User with id '${uid}' not found`,
								status: 404,
								code: 'auth/user-not-found',
							});
						}
					}
					throw error;
				}
				const [preferences] = await execute(
					createQueryBuilder(tables.preferences, 'preferences').where(
						'preferences.userId = :uid',
						{ uid }
					)
				);
				console.log(uid, preferences);
				const token = await auth.createCustomToken(uid, {
					source: 'vscode',
					...{
						organizationId: preferences.organizationId,
						workspaceId: preferences.workspaceId,
						projectId: preferences.projectId,
						aknowledged: true,
					},
				});
				return output.ok({
					accessToken: token,
				});
			},
		}),
	],
	tables: {
		organizations: table({
			fields: {
				name: field({
					type: 'short-text',
					validations: [mandatory(), unique()],
				}),
			},
		}),
		workspaces: table({
			fields: {
				name: field({ type: 'short-text', validations: [mandatory()] }),
				organization: field.relation({
					references: useTable('organizations'),
					relationship: 'many-to-one',
				}),
			},
		}),
		projects: table({
			constraints: [index('name', 'workspace')],
			fields: {
				name: field({ type: 'short-text', validations: [mandatory()] }),
				workspace: field.relation({
					references: useTable('workspaces'),
					relationship: 'many-to-one',
					validations: [mandatory()],
				}),
			},
		}),
		members: table({
			fields: {
				user: field.relation({
					references: useTable('users'),
					relationship: 'many-to-one',
				}),
				organization: field.relation({
					references: useTable('organizations'),
					relationship: 'many-to-one',
				}),
			},
		}),
		organizationsMembers: table({
			fields: {
				organization: field.relation({
					references: useTable('organizations'),
					relationship: 'many-to-one',
				}),
				member: field.relation({
					references: useTable('members'),
					relationship: 'many-to-one',
				}),
			},
		}),
		// workspace may have memebers from own organization
		workspacesMembers: table({
			fields: {
				workspace: field.relation({
					references: useTable('workspaces'),
					relationship: 'many-to-one',
				}),
				member: field.relation({
					references: useTable('members'),
					relationship: 'many-to-one',
				}),
			},
		}),
		users: table({
			fields: {
				id: field.primary({ type: 'string', generated: false }),
				// TODO: assign organizationId, workspaceId, projectId
			},
		}),
		preferences: table({
			fields: {
				user: field.relation({
					references: useTable('users'),
					relationship: 'one-to-one',
				}),
				organization: field.relation({
					references: useTable('organizations'),
					relationship: 'many-to-one',
				}),
				workspace: field.relation({
					references: useTable('workspaces'),
					relationship: 'many-to-one',
				}),
				project: field.relation({
					references: useTable('projects'),
					relationship: 'many-to-one',
				}),
			},
		}),
	},
});
