import "./sets.arr" as S

shadow set = S.set

check "Basic test":
  s = [set: "a", "b", "c"]
  s.member("b") is true
end

check "Make sure the type-test worked":
  # This fails because of the type test in union
  s = [set: "a", "b", "c"]
  s.union(5) raises "type-mismatch"
end

check "Make sure the annotation works":
  fun id(s :: S.Set):
    s
  end

  id(5) raises "type-mismatch"
end
