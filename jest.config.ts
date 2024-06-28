import type { Config } from 'jest'


const config: Config =
{
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: { '^.+\\.[t|j]sx?$': 'ts-jest' },
	testMatch: [ '<rootDir>/test/**/*.ts' ],
}


export default config
