
export namespace fp {
  export function hasSameDir(dir: string, subdir: string): boolean{
    return !!samedir(dir, subdir);
  }

  export function samedir(a: string, b: string): string | undefined {
    if (a == '' || b == '') return undefined

    let [ _a, _b ] = [ a, b ]
    if (_a == _b) return _a
    if (_a == '' || _b === '') return undefined

    _a = _a.length < _b.length ? _a : _b
    _b = _b.length > _a.length ? _b : _a
    
    let [ fromIndex, same ] = [ 0, '' ]
    while((fromIndex = _b.indexOf('/', ++fromIndex)) != -1){
      const substr = _b.slice(0, fromIndex)
      if (_a == substr || (substr != '' && _a.startsWith(substr)))
        same = substr
      else 
        break
    }

    return same || undefined
  }

  /**
   * 
   * @param refer 
   * @param a 
   * @param b 
   */
  function referCompare(refer: string, a: string, b: string): number{
    if (a == b) return 0

    const [_a, _b] = [samedir(refer, a), samedir(refer, b)]
    if (typeof _a == 'undefined' && typeof _b == 'undefined') return 0
    if (typeof _a == 'undefined') return -1
    if (typeof _b == 'undefined') return 1

    return _a.length - _b.length
  }
}
