export type DiffOp = "equal" | "add" | "remove";

export interface DiffLine {
  op: DiffOp;
  text: string;
  leftNumber: number | null;
  rightNumber: number | null;
}

// Longest Common Subsequence based line diff (Myers-style via DP table).
// Fine for typical file/config sizes; O(n*m) time and space.
export function diffLines(left: string, right: string): DiffLine[] {
  const a = left.split("\n");
  const b = right.split("\n");
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let leftNumber = 1;
  let rightNumber = 1;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({
        op: "equal",
        text: a[i],
        leftNumber: leftNumber++,
        rightNumber: rightNumber++,
      });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({
        op: "remove",
        text: a[i],
        leftNumber: leftNumber++,
        rightNumber: null,
      });
      i++;
    } else {
      result.push({
        op: "add",
        text: b[j],
        leftNumber: null,
        rightNumber: rightNumber++,
      });
      j++;
    }
  }

  while (i < n) {
    result.push({
      op: "remove",
      text: a[i],
      leftNumber: leftNumber++,
      rightNumber: null,
    });
    i++;
  }

  while (j < m) {
    result.push({
      op: "add",
      text: b[j],
      leftNumber: null,
      rightNumber: rightNumber++,
    });
    j++;
  }

  return result;
}
