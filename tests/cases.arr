data List:
  | empty
  | link(f, r)
end

cases(List) empty:
  | empty => "empty"
  | link(f, r) => "link"
end
