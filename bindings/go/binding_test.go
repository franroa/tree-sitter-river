package tree_sitter_river_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_river "github.com/franroa/tree-sitter-river.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_river.Language())
	if language == nil {
		t.Errorf("Error loading River grammar")
	}
}
