export const exampleQuestion = `
&lt;!-- This is an example question, replace with your own. Remove this line! -->
<p>Given an integer array nums, return all the triplets 
\t<code>[nums[i], nums[j], nums[k]]</code> such that 
\t<code>i != j</code>, 
\t<code>i != k</code>, and 
\t<code>j != k</code>, and 
\t<code>nums[i] + nums[j] + nums[k] == 0</code>.
</p>\n\n
<p>Notice that the solution set must not contain duplicate triplets.</p>\n\n
<p>&nbsp;</p>\n

<p>
\t<strong class=\\"example\\">Example 1:</strong>
</p>\n\n

\n

<p>\t<strong>Input:</strong> nums = [-1,0,1,2,-1,-4]\n\n
</p>
<p>\t<strong>Output:</strong> [[-1,-1,2],[-1,0,1]]\n</p>
<p>\t<strong>Explanation:</strong> \nnums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nnums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2].\nNotice that the order of the output and the order of the triplets does not matter.\n</p>
\n\n


<p>
\t<strong class=\\"example\\">Example 2:</strong>
</p>\n\n

<pre>\n
\t<strong>Input:</strong> nums = [0,1,1]\n
\t<strong>Output:</strong> []\n
\t<strong>Explanation:</strong> The only possible triplet does not sum up to 0.\n
</pre>\n\n

<p>
\t<strong class=\\"example\\">Example 3:</strong>
</p>\n\n

<pre>\n
\t<strong>Input:</strong> nums = [0,0,0]\n
\t<strong>Output:</strong> [[0,0,0]]\n
\t<strong>Explanation:</strong> The only possible triplet sums up to 0.\n
</pre>\n\n

<p>&nbsp;</p>\n
<p>
\t<strong>Constraints:</strong>
</p>\n\n
<ul>\n\t
\t<li>
\t\t<code>3 &lt;= nums.length &lt;= 3000</code>
\t</li>\n\t
\t<li>
\t\t<code>-10
\t\t\t<sup>5</sup> &lt;= nums[i] &lt;= 10
\t\t\t<sup>5</sup>
\t\t</code>
\t</li>\n
</ul>\n",
`;
