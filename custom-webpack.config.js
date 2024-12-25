var webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const exec = require('child_process');
const pkgData = require('./package.json');


let timer__start_script = new Date();
let timer__before_compile = new Date();
let timer__after_compile = new Date();
let timer__done_webpack = new Date();

const mainProcess = process;

let devServerExport = {}



devServerExport = {
  ...devServerExport,
  onListening: (args) => {
      console.info("******************************");
      console.info("* DevServer is start listen   ");
      console.info(`*    Host : ${args.options.host}  `);
      console.info(`*    Port : ${args.options.port}  `);
      console.info(`* CtxPath : ${args.options.devMiddleware?.publicPath}  `);
      console.info("******************************");

      devServer_detectedArg=args
  }
};


let now = new Date();
let buildDateTime =   [
                        ,now.getFullYear()
                        ,((now.getMonth()+1)+'').padStart(2,'0')
                        ,now.getDate()
                        ,(now.getHours()+'').padStart(2,'0')
                        ,(now.getMinutes()+'').padStart(2,'0')
                    ].join("");

console.info("buildDateTime : ", buildDateTime);



let branchName = null;
let revision = null; 
let revisionShort = buildDateTime;
let buildUser = process.env.USERNAME;


if(process.env.BUILD_BRANCH) {
  branchName = process.env.BUILD_BRANCH
}
if(process.env.BUILD_REVISION) {
  revision = process.env.BUILD_REVISION
}
if(process.env.BUILD_USER) {
  buildUser = process.env.BUILD_USER
}



let cmd_git_available=false;
try {
  exec.execSync('command -v git')
  cmd_git_available=true;
} catch(err) {
  console.error(err.message)
  console.warn('command [git] is not available')
}

if(cmd_git_available) {
  
  console.error("try to read revision using git command...");
  if(revision == null) {
      revision = exec .execSync('git rev-parse HEAD')
                      .toString().trim();
  }
  if(branchName == null) {
      branchName = exec.execSync('git branch --show-current')
                      .toString().trim();
  }
}




if(!revision) {
  console.warn("try to read git revision from file system instead ...");
  try {

      gitMetaPath = '.git';

      const gitHeadRef = fs.readFileSync( path.join(gitMetaPath, 'HEAD'),
                                          {encoding:'utf8', flag:'r'});
      let headRefPath = path.join(   gitMetaPath, gitHeadRef.substring(5).trimEnd());
      console.log("read from ", headRefPath);
      revision = fs.readFileSync( headRefPath,
                                  {encoding:'utf8', flag:'r'});
      branchName = headRefPath.substring(headRefPath.lastIndexOf('/')+1);
  } catch (err) {
      console.error("found error :", err.message);
  }
}

let buildNumber = buildDateTime;
if(revision) {
  let revisionShort_old=revisionShort;
  revisionShort=revision.substring(0,8);
  console.log(`revision : ${revision}`)
  console.log(`revisionShort(before) : ${revisionShort_old}`)
  console.log(`revisionShort(after)  : ${revisionShort}`)
}


function dateExplainStr(tt) {
  return (Math.floor((tt.getTime()/1000)/(60*60*24)) + " day ") 
      + tt.getHours() + " hour " 
      + tt.getMinutes() + " minute " 
      + tt.getSeconds() + "."+ (""+tt.getMilliseconds()).padStart(3,'0') + " sec.";
}
function PrjCustomWebpackPlugin(option) {
  this.option = option;
}
PrjCustomWebpackPlugin.prototype.apply = function apply(compiler) {

  let self=this;
  // https://webpack.js.org/api/compiler-hooks/#aftercompile
  compiler.hooks.beforeRun.tap('PrjCustomWebpackPlugin', (compilation) => {
      console.log('### [PrjCustomWebpackPlugin] :: beforeRun hook called', compilation)
  });

  // https://webpack.js.org/api/compiler-hooks/#aftercompile
  compiler.hooks.beforeCompile.tap('PrjCustomWebpackPlugin', (compilation) => {
    timer__before_compile=new Date();
    if(self.option?.debugBeforeCompile == true) {
        console.log('### [PrjCustomWebpackPlugin] :: beforeCompile hook called', compilation)
    }
  });

  // https://webpack.js.org/api/compiler-hooks/#aftercompile
  compiler.hooks.afterCompile.tap('PrjCustomWebpackPlugin', (compilation) => {
    timer__after_compile=new Date();
    if(self.option?.debugAfterCompile == true) {
      console.log('### [PrjCustomWebpackPlugin] :: afterCompile hook called', compilation)
    }
  });

  
  // https://webpack.js.org/api/compiler-hooks/#compilation
  compiler.hooks.compilation.tap('PrjCustomWebpackPlugin', (compilation, compilationParams) => {
    if(self.option?.debugCompilation == true) {
        console.log('### [PrjCustomWebpackPlugin] :: compilation hook called', compilation)
    }
  });

  // https://webpack.js.org/api/compiler-hooks/#done
  compiler.hooks.done.tap('PrjCustomWebpackPlugin', (stats) => {
    
    timer__done_webpack=new Date();
    console.log("\n\n")
    console.log('####################################################')
    console.log('### [PrjCustomWebpackPlugin] :: done hook called ###')
    console.log('####################################################')
    console.log('PrjCustomWebpackPlugin option :: ', this.option)
    setTimeout(() => {

      let diff__start_script__to__begin_compile = new Date(timer__before_compile.getTime() - timer__start_script.getTime());
      let diff__begin_compile__to__end_compile  = new Date(timer__after_compile.getTime() - timer__before_compile.getTime());
      let diff__begin_compile__to__done_webpack = new Date(timer__done_webpack.getTime() - timer__before_compile.getTime());
      
      console.info(`timer__start_script : ${timer__start_script}`);  
      console.info(`timer__before_compile : ${timer__before_compile}   (${dateExplainStr(diff__start_script__to__begin_compile)} from start `);  
      console.info(`timer__after_compile : ${timer__after_compile}     (${dateExplainStr(diff__begin_compile__to__end_compile) } from compile `);  
      console.info(`timer__done_webpack : ${timer__done_webpack}       (${dateExplainStr(diff__begin_compile__to__done_webpack)} from compile `);  
      console.info(`\x1b[32m√\x1b[0m Application is ready to browse`);
      if(this.option?.callbackAfterDone) {
        this.option.callbackAfterDone()
      }
    }, 500);
  });
}

let openssl_available=false;
try {
  exec.execSync('command -v openssl')
  openssl_available=true;
} catch(err) {
  console.error(err.message)
  console.warn('command [openssl] is not available')
}

if(!fs.existsSync('private.runtime.env')) {
  fs.writeFileSync('private.runtime.env', `
    PRIVATE_CREDENTIAL_001=example credential 001
    PRIVATE_CREDENTIAL_002=example credential 002
  `);
  console.warn('please update [private.runtime.env] before build to encrypt your credential before publish.')
}

if(openssl_available) {

  // Generate Key&IV
  exec.execSync('openssl rand -hex 32 > "/tmp/aes256-cbc.k-hex.runtime.txt"')
  exec.execSync('openssl rand -hex 32 > "/tmp/aes256-cbc.iv-hex.runtime.txt"')
  // Store Key&IV to credential-content
  exec.execSync('cat "/tmp/aes256-cbc.k-hex.runtime.txt" > "/tmp/credential.runtime.content"')
  exec.execSync('echo ":" >> "/tmp/credential.runtime.content"')
  exec.execSync('cat "/tmp/aes256-cbc.iv-hex.runtime.txt" >> "/tmp/credential.runtime.content"')


  // Generate asymetric private key
  exec.execSync('openssl genrsa -out rsa-private.runtime.pem 2048')
  // Generate asymetric public key
  exec.execSync('openssl rsa -pubout -in rsa-private.runtime.pem -out rsa-public.runtime.pem')
  // Encrypt credential-content using asymetric key pair 
  exec.execSync('openssl rsautl -encrypt -inkey rsa-public.runtime.pem  -pubin -in "/tmp/credential.runtime.content"      -out "/tmp/credential.runtime.content.pub.enc"')
  // Decrypt credential-content using asymetric key pair (for POC)
  exec.execSync('openssl rsautl -decrypt -inkey rsa-private.runtime.pem        -in "/tmp/credential.runtime.content.pub.enc" > "/tmp/credential.runtime.content.pub.dec"')
  
  
  // Create config-content from template and fill with ENV-VAR 
  exec.execSync(`envsubst < "src/assets/data/cfg.template.json" > "/tmp/cfg.runtime.json"`)
  // Encrypt config-content using aes256-cbc
  exec.execSync(`
    aes_cbc_key=$(cat "/tmp/aes256-cbc.k-hex.runtime.txt") && \\
    aes_cbc_iv=$(cat "/tmp/aes256-cbc.iv-hex.runtime.txt") && \\
    openssl enc -aes-256-cbc -nosalt -e \\
      -in "/tmp/cfg.runtime.json" -out "/tmp/cfg.runtime.json.aes-enc" \\
      -K "$aes_cbc_key" -iv "$aes_cbc_iv"
  `)
  // Decrypt config-content using aes256-cbc (for POC)
  exec.execSync(`
    aes_cbc_key=$(cat "/tmp/aes256-cbc.k-hex.runtime.txt") && \\
    aes_cbc_iv=$(cat "/tmp/aes256-cbc.iv-hex.runtime.txt") && \\
    openssl enc -aes-256-cbc -nosalt -d \\
      -in "/tmp/cfg.runtime.json.aes-enc" \\
      -K "$aes_cbc_key" -iv "$aes_cbc_iv" > "/tmp/cfg.runtime.json.aes-dec"
  `)
}
var rsa_enc_b64__text=null
if(fs.existsSync("/tmp/credential.runtime.content.pub.enc")) {
  // Place encripted credential-content to publish directory
  exec.execSync('base64 -w 0 "/tmp/credential.runtime.content.pub.enc" > "/tmp/secret.runtime.pub.enc-b64"')
  rsa_enc_b64__text=fs.readFileSync("/tmp/secret.runtime.pub.enc-b64").toString('utf-8');
}
if(fs.existsSync("/tmp/cfg.runtime.json.aes-enc")) {
  // Place encripted config-content to publish directory
  exec.execSync('base64 -w 0 "/tmp/cfg.runtime.json.aes-enc" > "src/assets/data/cfg.runtime.enc-b64"')
}



console.info('')
console.info(`╭─────────< auto generate file :: deployment.runtime.json >─────────╮`);
console.log(`check env[      DEPLOYMENT_RELEASE:${mainProcess.env.DEPLOYMENT_RELEASE}]`);
console.log(`check env[ DEPLOYMENT_CFG_REVISION:${mainProcess.env.DEPLOYMENT_CFG_REVISION}]`);
console.log(`check env[           ENV_CODE_NAME:${mainProcess.env.ENV_CODE_NAME}]`);
/* inject ENV RELEASE INFO to asset file */
let deploymentInfoData = fs.readFileSync('src/assets/data/deployment.template.json', 'utf-8')
let regexp__env_deploy_release = new RegExp(`[$][{]DEPLOY_APP_VERSION[}]`, "g");
let regexp__env_cfg_revision = new RegExp(`[$][{]DEPLOY_CONFIG_VERSION[}]`, "g");
let regexp__env_serv_env_name = new RegExp(`[$][{]DEPLOY_ENV_CODE_NAME[}]`, "g");
let regexp__rsa_enc_b64 = new RegExp(`[$][{]RSA_ENC_B64[}]`, "g");

deploymentInfoData = deploymentInfoData.replace(regexp__env_deploy_release, process.env['DEPLOYMENT_RELEASE']??'n/a')
deploymentInfoData = deploymentInfoData.replace(regexp__env_cfg_revision, process.env['DEPLOYMENT_CFG_REVISION']??'n/a')
deploymentInfoData = deploymentInfoData.replace(regexp__env_serv_env_name, process.env['ENV_CODE_NAME']??'n/a')
deploymentInfoData = deploymentInfoData.replace(regexp__rsa_enc_b64, rsa_enc_b64__text??'')
fs.writeFileSync('src/assets/data/deployment.runtime.json', deploymentInfoData, 'utf-8');
console.info(`╰─────────< auto generate file :: deployment.runtime.json >─────────╯`);





module.exports.devServer = {
  ...devServerExport
}
module.exports.output = {
  filename: `[name].${revisionShort}-[contenthash].js`,
  clean: true
}
module.exports.plugins = [
    new webpack.DefinePlugin({
        'buildInfo': JSON.stringify({
                        systemName: pkgData.name,
                        version: pkgData.version,
                        buildNumber: buildNumber,
                        buildTime: now.getTime(),
                        revision: revision,
                        revisionShort: revisionShort,
                        branchName: branchName,
                        buildUser: buildUser
                }),
        'rsaConfig': JSON.stringify({
            "pub": fs.readFileSync('rsa-public.runtime.pem','utf8'),
            "prv": fs.readFileSync('rsa-private.runtime.pem','utf8')
        })
    }),
    new PrjCustomWebpackPlugin({
        callbackAfterDone: () => {
            
            let envCypress=mainProcess.env.CYPRESS;
            

            console.log(`check env[      DEPLOYMENT_RELEASE:${mainProcess.env.DEPLOYMENT_RELEASE}]`);
            console.log(`check env[ DEPLOYMENT_CFG_REVISION:${mainProcess.env.DEPLOYMENT_CFG_REVISION}]`);
            console.log(`check env[           ENV_CODE_NAME:${mainProcess.env.ENV_CODE_NAME}]`);

            console.log(`PrjCustomWebpackPlugin.callbackAfterDone check env[CYPRESS:${envCypress}]`);
            
            setTimeout(() => {
                if(envCypress != null) {
                    if(childProcess_cypress == null) {
                        console.log(`start childProcess_cypress...`)
                        doCypressProcess(envCypress);
                    } else {
                        console.log(`childProcess_cypress(${childProcess_cypress.pid}) : process already exist`)
                    }
                } 
            }, 500)
        },
        debugAfterCompile: (process.env.IS_DEBUG_COMPILATION != null),
        debugBeforeCompile: (process.env.IS_DEBUG_COMPILATION != null),
        debugCompilation: (process.env.IS_DEBUG_COMPILATION != null),
    })
]



console.info(`╭─────────< custom-webpack :: module.exports >─────────╮`);
console.info(module.exports)
console.info(`╰─────────< custom-webpack :: module.exports >─────────╯`);

console.info("custom-webpack config is loaded, continue process ...");