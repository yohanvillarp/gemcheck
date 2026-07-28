import { FileInfo, API } from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let dirtyFlag = false;

  root.find(j.VariableDeclaration, { kind: 'var' }).forEach(path => {
    // Solo cambiar var por let de manera segura
    path.node.kind = 'let';
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : null;
}
