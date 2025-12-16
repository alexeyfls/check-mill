
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const DOCKER_BUILDKIT: string;
	export const ENABLE_DYNAMIC_INSTALL: string;
	export const LESSOPEN: string;
	export const CSB: string;
	export const PYTHONIOENCODING: string;
	export const CSB_EXEC_ID: string;
	export const rvm_script_name: string;
	export const PITCHER_CLIENTS_WSS_PORT: string;
	export const USER: string;
	export const rvm_gemstone_package_file: string;
	export const rvm_pretty_print_flag: string;
	export const rvm_quiet_flag: string;
	export const rvm_ruby_bits: string;
	export const rvm_hook: string;
	export const npm_config_user_agent: string;
	export const RVM_PATH: string;
	export const SUPERVISOR_GROUP_NAME: string;
	export const NVS_ROOT: string;
	export const GIT_EDITOR: string;
	export const HOSTNAME: string;
	export const CONDA_SCRIPT: string;
	export const PIPX_HOME: string;
	export const DOTNET_USE_POLLING_FILE_WATCHER: string;
	export const GIT_ASKPASS: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const BROWSER: string;
	export const npm_config_noproxy: string;
	export const OLDPWD: string;
	export const PITCHER_HOST_UID: string;
	export const HUGO_ROOT: string;
	export const HOME: string;
	export const CONDA_SHLVL: string;
	export const LESS: string;
	export const ORYX_ENV_TYPE: string;
	export const NVM_BIN: string;
	export const TERM_PROGRAM_VERSION: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const DYNAMIC_INSTALL_ROOT_DIR: string;
	export const DOTNET_RUNNING_IN_CONTAINER: string;
	export const PERMISSION_WATCHER_VERSION: string;
	export const NVM_SYMLINK_CURRENT: string;
	export const PIPX_BIN_DIR: string;
	export const NVM_INC: string;
	export const ZSH: string;
	export const LSCOLORS: string;
	export const rvm_sdk: string;
	export const CSB_WORKSPACE_PATH: string;
	export const ORYX_DIR: string;
	export const GRADLE_HOME: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const PAGER: string;
	export const LC_CTYPE: string;
	export const JUPYTERLAB_PATH: string;
	export const MAVEN_HOME: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const GOROOT: string;
	export const NODE_ROOT: string;
	export const rvm_gemstone_url: string;
	export const _CE_M: string;
	export const COLORTERM: string;
	export const COLOR: string;
	export const PYTHON_PATH: string;
	export const NVM_DIR: string;
	export const rvm_alias_expanded: string;
	export const DOTNET_SKIP_FIRST_TIME_EXPERIENCE: string;
	export const NVS_HOME: string;
	export const LOGNAME: string;
	export const _: string;
	export const PROJECT_GID: string;
	export const rvm_bin_path: string;
	export const SDKMAN_CANDIDATES_API: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const RUBY_VERSION: string;
	export const PROMPT_DIRTRIM: string;
	export const IRBRC: string;
	export const USER_ZDOTDIR: string;
	export const rvm_ruby_make_install: string;
	export const rvm_use_flag: string;
	export const WORKSPACE_PATH: string;
	export const TERM: string;
	export const NPM_CONFIG_STORE_DIR: string;
	export const DOTNET_ROOT: string;
	export const PITCHER_BIN_PATH: string;
	export const WATCHMAN_VERSION: string;
	export const NVS_DIR: string;
	export const _CE_CONDA: string;
	export const PHP_ROOT: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const PITCHER_WORKSPACE_PATH: string;
	export const YARN_CACHE_FOLDER: string;
	export const JAVA_ROOT: string;
	export const SDKMAN_CANDIDATES_DIR: string;
	export const rvm_ruby_make: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const HUGO_DIR: string;
	export const NPM_GLOBAL: string;
	export const rvm_nightly_flag: string;
	export const ZSH_DISABLE_COMPFIX: string;
	export const MY_RUBY_HOME: string;
	export const rvm_ruby_file: string;
	export const LANG: string;
	export const VSCODE_INJECTION: string;
	export const FNM_DIR: string;
	export const SDKMAN_DIR: string;
	export const RUBY_ROOT: string;
	export const SUPERVISOR_ENABLED: string;
	export const LS_COLORS: string;
	export const SDKMAN_PLATFORM: string;
	export const TERM_PROGRAM: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_lifecycle_script: string;
	export const CONDA_PYTHON_EXE: string;
	export const SHELL: string;
	export const GOPATH: string;
	export const rvm_silent_flag: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const PITCHER_API_BASE_URL: string;
	export const rvm_prefix: string;
	export const rvm_ruby_mode: string;
	export const GEM_HOME: string;
	export const ORYX_PREFER_USER_INSTALLED_SDKS: string;
	export const CSB_BASE_PREVIEW_HOST: string;
	export const PITCHER_ENV: string;
	export const LESSCLOSE: string;
	export const CSB_PITCHER_MANAGER_BASE_URL: string;
	export const ORYX_SDK_STORAGE_BASE_URL: string;
	export const rvm_proxy: string;
	export const CONDA_DIR: string;
	export const SUPERVISOR_SERVER_URL: string;
	export const rvm_version: string;
	export const SUPERVISOR_PROCESS_NAME: string;
	export const DEBIAN_FLAVOR: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const rvm_docs_type: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const NPM_CONFIG_CACHE: string;
	export const CODESANDBOX_HOST: string;
	export const JAVA_HOME: string;
	export const GEM_PATH: string;
	export const PWD: string;
	export const NVS_USE_XZ: string;
	export const npm_execpath: string;
	export const CONDA_EXE: string;
	export const NVM_CD_FLAGS: string;
	export const ZDOTDIR: string;
	export const rvm_only_path_flag: string;
	export const npm_config_global_prefix: string;
	export const rvm_niceness: string;
	export const npm_command: string;
	export const RAILS_DEVELOPMENT_HOSTS: string;
	export const PHP_PATH: string;
	export const PYTHON_ROOT: string;
	export const NVS_OS: string;
	export const rvm_bin_flag: string;
	export const MAVEN_ROOT: string;
	export const RUBY_HOME: string;
	export const rvm_path: string;
	export const __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: string;
	export const NUGET_XMLDOC_MODE: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		DOCKER_BUILDKIT: string;
		ENABLE_DYNAMIC_INSTALL: string;
		LESSOPEN: string;
		CSB: string;
		PYTHONIOENCODING: string;
		CSB_EXEC_ID: string;
		rvm_script_name: string;
		PITCHER_CLIENTS_WSS_PORT: string;
		USER: string;
		rvm_gemstone_package_file: string;
		rvm_pretty_print_flag: string;
		rvm_quiet_flag: string;
		rvm_ruby_bits: string;
		rvm_hook: string;
		npm_config_user_agent: string;
		RVM_PATH: string;
		SUPERVISOR_GROUP_NAME: string;
		NVS_ROOT: string;
		GIT_EDITOR: string;
		HOSTNAME: string;
		CONDA_SCRIPT: string;
		PIPX_HOME: string;
		DOTNET_USE_POLLING_FILE_WATCHER: string;
		GIT_ASKPASS: string;
		npm_node_execpath: string;
		SHLVL: string;
		BROWSER: string;
		npm_config_noproxy: string;
		OLDPWD: string;
		PITCHER_HOST_UID: string;
		HUGO_ROOT: string;
		HOME: string;
		CONDA_SHLVL: string;
		LESS: string;
		ORYX_ENV_TYPE: string;
		NVM_BIN: string;
		TERM_PROGRAM_VERSION: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		DYNAMIC_INSTALL_ROOT_DIR: string;
		DOTNET_RUNNING_IN_CONTAINER: string;
		PERMISSION_WATCHER_VERSION: string;
		NVM_SYMLINK_CURRENT: string;
		PIPX_BIN_DIR: string;
		NVM_INC: string;
		ZSH: string;
		LSCOLORS: string;
		rvm_sdk: string;
		CSB_WORKSPACE_PATH: string;
		ORYX_DIR: string;
		GRADLE_HOME: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		PAGER: string;
		LC_CTYPE: string;
		JUPYTERLAB_PATH: string;
		MAVEN_HOME: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		GOROOT: string;
		NODE_ROOT: string;
		rvm_gemstone_url: string;
		_CE_M: string;
		COLORTERM: string;
		COLOR: string;
		PYTHON_PATH: string;
		NVM_DIR: string;
		rvm_alias_expanded: string;
		DOTNET_SKIP_FIRST_TIME_EXPERIENCE: string;
		NVS_HOME: string;
		LOGNAME: string;
		_: string;
		PROJECT_GID: string;
		rvm_bin_path: string;
		SDKMAN_CANDIDATES_API: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		RUBY_VERSION: string;
		PROMPT_DIRTRIM: string;
		IRBRC: string;
		USER_ZDOTDIR: string;
		rvm_ruby_make_install: string;
		rvm_use_flag: string;
		WORKSPACE_PATH: string;
		TERM: string;
		NPM_CONFIG_STORE_DIR: string;
		DOTNET_ROOT: string;
		PITCHER_BIN_PATH: string;
		WATCHMAN_VERSION: string;
		NVS_DIR: string;
		_CE_CONDA: string;
		PHP_ROOT: string;
		npm_config_node_gyp: string;
		PATH: string;
		PITCHER_WORKSPACE_PATH: string;
		YARN_CACHE_FOLDER: string;
		JAVA_ROOT: string;
		SDKMAN_CANDIDATES_DIR: string;
		rvm_ruby_make: string;
		NODE: string;
		npm_package_name: string;
		HUGO_DIR: string;
		NPM_GLOBAL: string;
		rvm_nightly_flag: string;
		ZSH_DISABLE_COMPFIX: string;
		MY_RUBY_HOME: string;
		rvm_ruby_file: string;
		LANG: string;
		VSCODE_INJECTION: string;
		FNM_DIR: string;
		SDKMAN_DIR: string;
		RUBY_ROOT: string;
		SUPERVISOR_ENABLED: string;
		LS_COLORS: string;
		SDKMAN_PLATFORM: string;
		TERM_PROGRAM: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_lifecycle_script: string;
		CONDA_PYTHON_EXE: string;
		SHELL: string;
		GOPATH: string;
		rvm_silent_flag: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		PITCHER_API_BASE_URL: string;
		rvm_prefix: string;
		rvm_ruby_mode: string;
		GEM_HOME: string;
		ORYX_PREFER_USER_INSTALLED_SDKS: string;
		CSB_BASE_PREVIEW_HOST: string;
		PITCHER_ENV: string;
		LESSCLOSE: string;
		CSB_PITCHER_MANAGER_BASE_URL: string;
		ORYX_SDK_STORAGE_BASE_URL: string;
		rvm_proxy: string;
		CONDA_DIR: string;
		SUPERVISOR_SERVER_URL: string;
		rvm_version: string;
		SUPERVISOR_PROCESS_NAME: string;
		DEBIAN_FLAVOR: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		rvm_docs_type: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		NPM_CONFIG_CACHE: string;
		CODESANDBOX_HOST: string;
		JAVA_HOME: string;
		GEM_PATH: string;
		PWD: string;
		NVS_USE_XZ: string;
		npm_execpath: string;
		CONDA_EXE: string;
		NVM_CD_FLAGS: string;
		ZDOTDIR: string;
		rvm_only_path_flag: string;
		npm_config_global_prefix: string;
		rvm_niceness: string;
		npm_command: string;
		RAILS_DEVELOPMENT_HOSTS: string;
		PHP_PATH: string;
		PYTHON_ROOT: string;
		NVS_OS: string;
		rvm_bin_flag: string;
		MAVEN_ROOT: string;
		RUBY_HOME: string;
		rvm_path: string;
		__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: string;
		NUGET_XMLDOC_MODE: string;
		INIT_CWD: string;
		EDITOR: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
